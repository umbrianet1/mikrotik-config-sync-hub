
const { NodeSSH } = require('node-ssh');

class SSHService {
  constructor() {
    this.connections = new Map();
    this.timeout = parseInt(process.env.SSH_TIMEOUT) || 10000;
  }

  async connect(routerConfig) {
    const connectionKey = `${routerConfig.ip}:${routerConfig.port || 22}`;
    
    // Check if connection already exists and is valid
    if (this.connections.has(connectionKey)) {
      const existingConnection = this.connections.get(connectionKey);
      if (existingConnection.isConnected()) {
        console.log(`Reusing existing connection to ${connectionKey}`);
        return existingConnection;
      } else {
        this.connections.delete(connectionKey);
      }
    }

    console.log(`Creating new SSH connection to ${connectionKey}`);
    
    const ssh = new NodeSSH();
    
    try {
      await ssh.connect({
        host: routerConfig.ip,
        port: routerConfig.port || 22,
        username: routerConfig.username,
        password: routerConfig.password,
        timeout: this.timeout,
        readyTimeout: this.timeout,
        algorithms: {
          // MikroTik compatible algorithms
          kex: [
            'diffie-hellman-group14-sha256',
            'diffie-hellman-group14-sha1',
            'diffie-hellman-group1-sha1'
          ],
          cipher: [
            'aes128-ctr',
            'aes192-ctr',
            'aes256-ctr',
            'aes128-gcm',
            'aes128-gcm@openssh.com',
            'aes256-gcm',
            'aes256-gcm@openssh.com'
          ],
          serverHostKey: [
            'rsa-sha2-512',
            'rsa-sha2-256',
            'ssh-rsa',
            'ecdsa-sha2-nistp256',
            'ecdsa-sha2-nistp384',
            'ecdsa-sha2-nistp521'
          ],
          hmac: [
            'hmac-sha2-256',
            'hmac-sha2-512',
            'hmac-sha1'
          ]
        }
      });

      this.connections.set(connectionKey, ssh);
      console.log(`SSH connection established to ${connectionKey}`);
      
      return ssh;
    } catch (error) {
      console.error(`SSH connection failed to ${connectionKey}:`, error.message);
      throw new Error(`Failed to connect to router ${routerConfig.ip}: ${error.message}`);
    }
  }

  async executeCommand(connection, command) {
    try {
      console.log(`Executing command: ${command}`);
      
      const result = await connection.execCommand(command, {
        timeout: this.timeout
      });

      if (result.stderr && result.stderr.trim()) {
        console.warn(`Command stderr: ${result.stderr}`);
      }

      console.log(`Command completed successfully`);
      return result.stdout;
    } catch (error) {
      console.error(`Command execution failed: ${error.message}`);
      throw new Error(`Command execution failed: ${error.message}`);
    }
  }

  async disconnect(connection) {
    try {
      if (connection && connection.isConnected()) {
        await connection.dispose();
        console.log('SSH connection closed');
      }
    } catch (error) {
      console.warn('Error closing SSH connection:', error.message);
    }
  }

  async disconnectAll() {
    const promises = Array.from(this.connections.values()).map(connection => 
      this.disconnect(connection)
    );
    
    await Promise.allSettled(promises);
    this.connections.clear();
    console.log('All SSH connections closed');
  }
}

module.exports = new SSHService();
