// ScreenTemplate.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import CategorySelector from '../components/CategorySelector'; // Import the CategorySelector component

// Add category-related props to base interface
export interface BaseTemplateProps {
    title: string;
    isLoading?: boolean;
    error?: string | null;
    searchPlaceholder?: string;
    searchValue: string;
    onSearchChange: (text: string) => void;
    onRetry?: () => void;
    onAddPress?: () => void;
    addButtonLabel?: string;
    headerRight?: React.ReactNode;
    topSection?: React.ReactNode;
    filtersComponent?: React.ReactNode; // Keep for backward compatibility

    // New category selector props
    showCategorySelector?: boolean;
    categories?: { _id: string; name: string; icon: string; color: string }[];
    selectedCategory?: string;
    onCategorySelect?: (categoryId: string) => void;
}

// Template types
export interface ListTemplateProps extends BaseTemplateProps {
    type: 'list';
    renderItems: () => React.ReactNode;
    emptyStateText?: string;
    emptyStateIcon?: string;
}

export interface GridTemplateProps extends BaseTemplateProps {
    type: 'grid';
    renderGridItems: () => React.ReactNode;
    numColumns?: number;
    emptyStateText?: string;
}

export interface MapTemplateProps extends BaseTemplateProps {
    type: 'map';
    renderMap: () => React.ReactNode;
    renderOverlays?: () => React.ReactNode;
}

export interface TabbedTemplateProps extends BaseTemplateProps {
    type: 'tabbed';
    tabs: {
        key: string;
        label: string;
        content: () => React.ReactNode;
    }[];
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export type ScreenTemplateProps =
    | ListTemplateProps
    | GridTemplateProps
    | MapTemplateProps
    | TabbedTemplateProps;

export default function ScreenTemplate(props: ScreenTemplateProps) {
    // Loading state
    if (props.isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2C6BED" />
            </View>
        );
    }

    // Error state
    if (props.error) {
        return (
            <View style={styles.loadingContainer}>
                <Feather name="alert-triangle" size={50} color="#FF6B6B" />
                <Text style={styles.errorText}>שגיאה</Text>
                <Text style={styles.errorSubtext}>{props.error}</Text>
                {props.onRetry && (
                    <TouchableOpacity onPress={props.onRetry} style={styles.retryButton}>
                        <Feather name="refresh-cw" size={16} color="white" />
                        <Text style={styles.retryButtonText}>נסה שוב</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    // Header, search, top section and filters
    const renderHeader = () => (
        <>
            <View style={styles.header}>
                {props.headerRight}
                <Text style={styles.headerTitle}>{props.title}</Text>
            </View>

            {props.type !== "map" ?
                <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color="#7A7A7A" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={props.searchPlaceholder || 'חפש...'}
                        placeholderTextColor="#7A7A7A"
                        value={props.searchValue}
                        onChangeText={props.onSearchChange}
                    />
                </View> : null}

            {props.topSection}

            {/* Built-in Category Selector */}
            {props.showCategorySelector && props.categories && props.categories.length > 0 && (
                <View style={styles.categoriesWrapper}>
                    <CategorySelector
                        categories={props.categories}
                        selectedCategory={props.selectedCategory || 'all'}
                        onSelect={props.onCategorySelect || (() => { })}
                    />
                </View>
            )}

            {/* Keep the custom filters component for backward compatibility */}
            {props.filtersComponent}
        </>
    );

    // Content
    const renderContent = () => {
        switch (props.type) {
            case 'list': {
                const listProps = props as ListTemplateProps;

                const items = listProps.renderItems();
                if (
                    React.Children.count(items) === 0 ||
                    (Array.isArray(items) && items.length === 0)
                ) {
                    return (
                        <View style={styles.emptyState}>
                            <Feather
                                name={listProps.emptyStateIcon || "inbox"}
                                size={50}
                                color="#CBD5E0"
                            />
                            <Text style={styles.emptyStateText}>
                                {listProps.emptyStateText || 'אין פריטים להצגה'}
                            </Text>
                        </View>
                    );
                }

                return (
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {items}
                    </ScrollView>
                );
            }

            case 'grid':
                return (
                    <ScrollView
                        contentContainerStyle={styles.gridContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {props.renderGridItems()}
                    </ScrollView>
                );

            case 'map':
                return (
                    <View style={styles.mapContainer}>
                        {props.renderMap()}
                        {props.renderOverlays && props.renderOverlays()}
                    </View>
                );

            case 'tabbed':
                return (
                    <>
                        <View style={styles.tabsContainer}>
                            {props.tabs.map(tab => (
                                <TouchableOpacity
                                    key={tab.key}
                                    style={[
                                        styles.tabButton,
                                        props.activeTab === tab.key && styles.activeTabButton,
                                    ]}
                                    onPress={() => props.onTabChange(tab.key)}
                                >
                                    <Text
                                        style={[
                                            styles.tabButtonText,
                                            props.activeTab === tab.key && styles.activeTabButtonText,
                                        ]}
                                    >
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.tabContent}>
                            {props.tabs.find(tab => tab.key === props.activeTab)?.content()}
                        </View>
                    </>
                );
        }
    };

    return (
        <View style={styles.container}>
            {renderHeader()}
            {renderContent()}

            {props.onAddPress && (
                <TouchableOpacity style={styles.addButton} onPress={props.onAddPress}>
                    <Text style={styles.addButtonText}>{props.addButtonLabel || 'הוסף'}</Text>
                    <Feather name="plus-circle" size={20} color="white" style={{ marginLeft: 10 }} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 20,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#4A4A4A',
        flex: 1,
        textAlign: 'right'
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 15,
        margin: 15,
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    searchIcon: { marginRight: 10 },
    searchInput: {
        flex: 1,
        height: 50,
        textAlign: 'right',
        fontSize: 16,
        color: '#4A4A4A',
    },
    // Add the categories wrapper style
    categoriesWrapper: {
        marginBottom: 10,
        paddingBottom: 5,
        zIndex: 1,
    },
    scrollContent: {
        padding: 20,
        flexGrow: 1,
    },
    gridContent: {
        padding: 15,
        flexGrow: 1,
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    addButton: {
        backgroundColor: '#2C6BED',
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2C6BED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
    },
    errorText: {
        fontSize: 18,
        color: '#E53E3E',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    errorSubtext: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#2C6BED',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingBottom: 10,
    },
    tabButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginLeft: 8,
        borderRadius: 20,
        backgroundColor: '#f4f4f4',
    },
    activeTabButton: {
        backgroundColor: '#2C6BED',
    },
    tabButtonText: {
        color: '#333',
        fontWeight: 'bold',
    },
    activeTabButtonText: {
        color: 'white',
    },
    tabContent: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#7A7A7A',
        marginTop: 10,
    },
});