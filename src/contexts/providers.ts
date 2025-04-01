// contexts/providers.ts
import { UserProvider } from './UserContext';
import { PreferencesProvider } from './PreferencesContext';
import { LocationProvider } from './LocationContext';
import { FavoritesProvider } from './FavoritesContext';
import { ViewedItemsProvider } from './ViewedItemsContext';
import { CategoriesProvider } from './CategoriesContext';
import { DraftProvider } from './DraftContext';
import { SearchProvider } from './SearchContext';
import { JobsProvider } from './JobsContext';
import { ProductsProvider } from './ProductsContext';
import { AnalyticsProvider } from './AnalyticsContext'; // ✅ חדש!

export const providers = [
    UserProvider,
    AnalyticsProvider,
    LocationProvider,
    PreferencesProvider,
    CategoriesProvider,
    ProductsProvider,
    FavoritesProvider,
    ViewedItemsProvider,
    DraftProvider,
    SearchProvider,
    JobsProvider
];
