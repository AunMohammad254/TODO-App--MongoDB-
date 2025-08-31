// Mock User model for testing
class MockUser {
  constructor(userData) {
    this.username = userData.username;
    this.email = userData.email;
    this.password = userData.password;
    this._id = 'mock-user-id-' + Date.now();
  }

  async save() {
    // Mock save operation
    return Promise.resolve(this);
  }

  static async findOne(query) {
    // Mock findOne - return null (no existing user)
    return Promise.resolve(null);
  }

  static async deleteOne(query) {
    // Mock deleteOne
    return Promise.resolve({ deletedCount: 1 });
  }

  static async find(query = {}) {
    // Mock find
    return Promise.resolve([]);
  }
}

module.exports = MockUser;