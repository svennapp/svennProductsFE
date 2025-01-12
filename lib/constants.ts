// lib/constants.ts

export const WAREHOUSES = ['byggmakker', 'monter', 'maxbo'] as const

export const SCRIPTS = [
  {
    id: 1,
    name: 'Byggmakker',
    description: 'Scrapes base data about products in Byggmakker',
    warehouse: 'byggmakker',
    filename: 'byggmakker/base_data.py',
  },
  {
    id: 2,
    name: 'Byggmakker Retailer Processor',
    description: 'Processes data for byggmakker retailers',
    warehouse: 'byggmakker',
    filename: 'byggmakker/retailer_data.py',
  },
  {
    id: 3,
    name: 'Byggmakker Store Processor',
    description: 'Processes data for byggmakker stores',
    warehouse: 'byggmakker',
    filename: 'byggmakker/store_data.py',
  },
  {
    id: 4,
    name: 'Byggmakker prices Processor',
    description: 'Processes data for byggmakker Prices',
    warehouse: 'byggmakker',
    filename: 'byggmakker/prices.py',
  },
] as const

export const COMMON_SCHEDULES = [
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Daily at midnight', value: '0 0 * * *' },
  { label: 'Weekly on Sunday', value: '0 0 * * 0' },
  { label: 'Monthly', value: '0 0 1 * *' },
]
