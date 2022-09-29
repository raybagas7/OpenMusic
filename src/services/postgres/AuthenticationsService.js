const { Pool } = require('pg');

class AuthenticationsService {
  constructor() {
    this.pool = new Pool();
  }

  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO ',
    };
  }
}
