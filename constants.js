let { BigNumber } = require('@0x/utils');

module.exports = {
    ONE_SECOND_MS: 1000,
    ONE_MINUTE_MS: 1000 * 60,
    TEN_MINUTES_MS: 60000 * 10,
    UNLIMITED_ALLOWANCE_IN_BASE_UNITS: new BigNumber(2).pow(256).minus(1),
    DECIMALS: 18,
    NULL_ADDRESS: '0x0000000000000000000000000000000000000000',
    NULL_BYTES: '0x',
    ZERO: new BigNumber(0),
    ROPSTEN_NETWORK_ID: 3,
    MATIC_NETWORK_ID: 80001
}

