import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {isEmpty} from 'lodash';
import {Image} from 'react-native';

const Category = () => {
  const [selectedItem, setSelectedItem] = useState('');
  const [categoryData, setCategoryData] = useState('');
  const [subCategory, setSubCategory] = useState([]);
  const [productList, setProductList] = useState([]);
  const [catPageIndex, setCatPageIndex] = useState(1);
  const [productIndex, setProductIndex] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadProducts, setLoadProducts] = useState(false);
  const catId = 56;
  const subCatId = 71;
  useEffect(() => {
    fetchCategory();
  }, []);

  useEffect(() => {
    if (selectedItem === 'Ceramic') {
      fetchSubCategory();
    } else {
      setCatPageIndex(1);
    }
  }, [selectedItem, catPageIndex]);

  const fetchCategory = async () => {
    try {
      const response = await axios.post(
        `http://esptiles.imperoserver.in/api/API/Product/DashBoard`,
        {
          CategoryId: 0,
          DeviceManufacturer: 'Google',
          DeviceModel: 'Android SDK built for x86',
          DeviceToken: ' ',
          PageIndex: 1,
        },
      );
      setCategoryData(response.data?.Result?.Category);
    } catch (error) {
      console.error('Error fetching category data:', error);
    }
  };

  const fetchSubCategory = async () => {
    setIsLoadingMore(true);
    try {
      const response = await axios.post(
        `http://esptiles.imperoserver.in/api/API/Product/DashBoard`,
        {
          CategoryId: catId,
          PageIndex: catPageIndex,
        },
      );

      const newSubCategory =
        response.data?.Result?.Category?.[0]?.SubCategories || [];
      setSubCategory(prevSubCategory =>
        catPageIndex === 1
          ? newSubCategory
          : [...prevSubCategory, ...newSubCategory],
      );
      fetchProducts();
    } catch (error) {
      console.error('Error fetching subcategory data:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const fetchProducts = async () => {
    setLoadProducts(true);
    try {
      const response = await axios.post(
        `http://esptiles.imperoserver.in/api/API/Product/ProductList`,
        {
          SubCategoryId: subCatId,
          PageIndex: productIndex,
        },
      );
      const newProductList = response.data?.Result || [];
      setProductList(prevProductList =>
        productIndex === 1
          ? newProductList
          : [...prevProductList, ...newProductList],
      );
      setLoadProducts(false);
    } catch (error) {
      console.error('Error fetching subcategory data:', error);
      setLoadProducts(false);
    }
  };

  const handleItemClicked = item => {
    setSelectedItem(item?.Name);
    if (item?.Name !== 'Ceramic') {
      setSubCategory([]);
    }
  };

  const renderItem = ({item}) => {
    return (
      <View style={{padding: 15, marginTop: 10}}>
        <Text style={{fontWeight: 'bold', fontSize: 17}}>{item?.Name}</Text>
        {/* PRODUCTS LIST */}
        <View style={{flexDirection: 'row'}}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={productList}
            renderItem={data => (
              <View
                style={{
                  width: 140,
                }}>
                <Image
                  source={{uri: data?.item?.ImageName}}
                  style={{
                    height: 120,
                    width: 120,
                    borderRadius: 5,
                    marginRight: 5,
                  }}
                />
                <Text>{data?.item?.Name}</Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
            onEndReached={handleLoadMoreProducts}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderProducts}
          />
        </View>
      </View>
    );
  };

  const handleLoadMore = () => {
    setCatPageIndex(catPageIndex => catPageIndex + 1);
  };
  const handleLoadMoreProducts = () => {
    setProductIndex(productIndex => productIndex + 1);
    fetchProducts();
  };
  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    } else {
      return null;
    }
  };

  const renderProducts = () => {
    if (loadProducts) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }
  };

  return (
    <View style={{flex: 1}}>
      <ScrollView horizontal>
        {!isEmpty(categoryData) &&
          categoryData?.map((item, index) => {
            return (
              <TouchableOpacity
                key={item?.Id}
                style={styles.dataBox}
                onPress={() => handleItemClicked(item)}>
                <Text
                  style={{
                    color: selectedItem === item?.Name ? 'white' : 'gray',
                    fontSize: selectedItem === item?.Name ? 12 : 10,
                  }}>
                  {item?.Name}
                </Text>
              </TouchableOpacity>
            );
          })}
      </ScrollView>

      {selectedItem === 'Ceramic' ? (
        <View style={styles.ceramic}>
          <FlatList
            data={subCategory}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter} // Render the footer
          />
        </View>
      ) : (
        <View style={styles.container}>
          <Text>{selectedItem}</Text>
        </View>
      )}
    </View>
  );
};

export default Category;

const styles = StyleSheet.create({
  dataBox: {
    backgroundColor: 'black',
    marginRight: 2,
    width: 120,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    height: '95%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ceramic: {
    height: '95%',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
