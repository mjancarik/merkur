const channel = { emit: jest.fn() };
const addons = { getChannel: () => channel };

module.exports = { addons };
