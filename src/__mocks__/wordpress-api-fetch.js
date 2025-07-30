// Mock for @wordpress/api-fetch
const apiFetch = jest.fn();

// Add common methods and properties
apiFetch.use = jest.fn();
apiFetch.setFetchHandler = jest.fn();
apiFetch.createNonceMiddleware = jest.fn();
apiFetch.createPreloadingMiddleware = jest.fn();
apiFetch.createRootURLMiddleware = jest.fn();
apiFetch.fetchAllMiddleware = jest.fn();

export default apiFetch;
