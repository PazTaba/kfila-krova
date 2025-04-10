// contexts/providers.ts
import { UserProvider } from './UserContext';
import { PreferencesProvider } from './PreferencesContext';
import { LocationProvider } from './LocationContext';
import { FavoritesProvider } from './FavoritesContext';
import { ViewedItemsProvider } from './ViewedItemsContext';
import { CategoriesProvider } from './CategoriesContext';
import { DraftProvider } from './DraftContext';
import { SearchProvider } from './SearchContext';
import { JobsProvider } from './jobs/JobsContext';
import { ProductsProvider } from './marketplace/ProductsContext';
import { AnalyticsProvider } from './AnalyticsContext';

export const providers = [
    UserProvider,
    LocationProvider,
    AnalyticsProvider,
    PreferencesProvider,
    CategoriesProvider,
    ProductsProvider,
    FavoritesProvider,
    ViewedItemsProvider,
    DraftProvider,
    SearchProvider,
    JobsProvider,
];
