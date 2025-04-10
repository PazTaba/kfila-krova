import React from 'react';
import {
    ScrollView,
    TouchableOpacity,
    View,
    Text,
    StyleSheet
} from 'react-native';

interface Category {
    _id: string;
    name: string;
    icon: string;
    color: string;
}

interface CategorySelectorProps {
    categories: Category[];
    selectedCategory: string;
    onSelect: (categoryId: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
    categories,
    selectedCategory,
    onSelect
}) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
            style={styles.categoriesScrollContainer}
        >
            {categories.map((category) => {
                const isSelected = selectedCategory === category._id;
                return (
                    <TouchableOpacity
                        key={category._id}
                        style={[
                            styles.categoryButton,
                            { backgroundColor: isSelected ? category.color : '#f4f4f4' }
                        ]}
                        onPress={() => onSelect(category._id)}
                    >
                        <View style={styles.categoryContent}>
                            <Text style={styles.categoryIcon}>{category.icon}</Text>
                            <Text
                                style={[
                                    styles.categoryName,
                                    { color: isSelected ? '#fff' : '#4A4A4A' }
                                ]}
                                numberOfLines={1}
                            >
                                {category.name}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    categoriesScrollContainer: {
        maxHeight: 100,
        backgroundColor: 'white',
    },
    categoriesContainer: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        flexDirection: 'row',
    },
    categoryButton: {
        width: 90,
        height: 70,
        marginHorizontal: 5,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryIcon: {
        fontSize: 22,
        marginBottom: 5,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default CategorySelector;
