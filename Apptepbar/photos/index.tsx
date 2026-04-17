import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';

// Import all category components in correct sequence
import {
  AllCategory,
  CyberpunkCategory,
  AestheticCategory,
  MacroCategory,
  StreetCategory,
  GamingCategory,
  SportsCategory,
  FamilyCategory,
  TechnicalCategory,
  NatureCategory,
  AiArtCategory,
  CarsCategory,
  TravelCategory,
  FoodCategory,
  FashionCategory,
  ArchitectureCategory,
  AnimalsCategory,
  SpaceCategory,
  MusicCategory,
  ArtCategory,
  PhotographyCategory,
  VintageCategory,
  WallpaperCategory,
} from './Categories';

interface Category {
  id: string;
  name: string;
  component: React.ComponentType<any>;
}

// Global text styles for all categories
const globalTextStyles = {
  titleFontSize: 13,
  subtitleFontSize: 11,
  categoryFontSize: 14,
};

const categories: Category[] = [
  { id: '1', name: 'All', component: AllCategory },
  { id: '2', name: 'Cyberpunk', component: CyberpunkCategory },
  { id: '3', name: 'Aesthetic', component: AestheticCategory },
  { id: '4', name: 'Macro', component: MacroCategory },
  { id: '5', name: 'Street', component: StreetCategory },
  { id: '6', name: 'Gaming', component: GamingCategory },
  { id: '7', name: 'Sports', component: SportsCategory },
  { id: '8', name: 'Family', component: FamilyCategory },
  { id: '9', name: 'Technical', component: TechnicalCategory },
  { id: '10', name: 'Nature', component: NatureCategory },
  { id: '11', name: 'AI Art', component: AiArtCategory },
  { id: '12', name: 'Cars', component: CarsCategory },
  { id: '13', name: 'Travel', component: TravelCategory },
  { id: '14', name: 'Food', component: FoodCategory },
  { id: '15', name: 'Fashion', component: FashionCategory },
  { id: '16', name: 'Architecture', component: ArchitectureCategory },
  { id: '17', name: 'Animals', component: AnimalsCategory },
  { id: '18', name: 'Space', component: SpaceCategory },
  { id: '19', name: 'Music', component: MusicCategory },
  { id: '20', name: 'Art', component: ArtCategory },
  { id: '21', name: 'Photography', component: PhotographyCategory },
  { id: '22', name: 'Vintage', component: VintageCategory },
  { id: '23', name: 'Wallpaper', component: WallpaperCategory },
];

export default function PhotoSection() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Auto-select 'All' category on app launch
  useEffect(() => {
    const allCategory = categories.find(cat => cat.name === 'All');
    if (allCategory) {
      setSelectedCategory(allCategory);
      console.log("[KRONOP-STARTUP] 'All' category auto-selected. Displaying photos on launch.");
    }
  }, []);

  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(category);
  };

  const renderSelectedCategory = () => {
    if (!selectedCategory) return null;
    
    const SelectedComponent = selectedCategory.component;
    return <SelectedComponent textStyles={globalTextStyles} />;
  };

  return (
    <View style={styles.container}>
      {/* Categories Horizontal Scroll */}
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.categoryName,
              selectedCategory?.id === category.id && styles.activeCategoryName
            ]}>
              {category.name}
            </Text>
            {selectedCategory?.id === category.id && (
              <View style={styles.activeIndicator} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Selected Category Content */}
      <View style={styles.contentContainer}>
        {renderSelectedCategory()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingRight: 40,
    paddingVertical: 4,
  },
  categoryItem: {
    marginRight: 24,
    alignItems: 'center',
    minHeight: 32,
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
    textAlign: 'center',
  },
  activeCategoryName: {
    color: '#FFF',
    fontWeight: '600',
  },
  activeIndicator: {
    width: 30,
    height: 2,
    backgroundColor: '#007AFF',
    borderRadius: 1,
    marginTop: 6,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
