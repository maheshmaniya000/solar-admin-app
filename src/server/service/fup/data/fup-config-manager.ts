let fupStaticConfig = null;

function lazyLoadFUPStaticConfig(): void {
  fupStaticConfig = [];
  console.log('... lazy load FUP static configuration');
  fupStaticConfig = JSON.parse(process.env.FUP_STATIC_CONFIG);
}
lazyLoadFUPStaticConfig();

/**
 * Get configuration for rules like (not logged user, logged user, ...)
 *
 * @param configType
 * @returns
 */
export function getFUPStaticConfig(configType): JSON {
  if (!fupStaticConfig) {
    lazyLoadFUPStaticConfig();
  }

  if (fupStaticConfig[configType]) {
    return fupStaticConfig[configType];
  } else {
    // throw new Error(`Unknown FUP configuration ${configType}`);
  }
}
