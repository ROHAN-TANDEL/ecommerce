# Use in your application
import { createContext } from './context';
import { userCacheExample } from './examples/redis/01-caching/user-cache';

const context = createContext(process.env);
const userCache = userCacheExample(context);

// Fetch user with caching
const user = await userCache.getUser('123');