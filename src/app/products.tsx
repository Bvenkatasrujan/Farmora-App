import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Star, Heart, ShieldCheck, Truck, RotateCcw, ShoppingCart } from 'lucide-react-native';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FarmoraColors } from '../constants/colors';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { products } = useAppStore();

  const product = products.find((p) => p.id === id);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!product) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-6">
        <Text className="text-slate-800 text-lg font-bold">Product Not Found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 py-2 px-4 bg-emerald-500 rounded-xl">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBuy = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Purchase Success',
        `Thank you for ordering ${product.name}! Your order has been placed with ${product.seller}.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 1500);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Top Navigation */}
      <View className="pt-6 pb-4 px-5 flex-row justify-between items-center border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-50 border border-slate-100 justify-center items-center rounded-xl active:scale-95">
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-slate-900 text-lg font-black uppercase">Product Info</Text>
        <TouchableOpacity onPress={() => setIsLiked(!isLiked)} className="w-10 h-10 bg-slate-50 border border-slate-100 justify-center items-center rounded-xl active:scale-95">
          <Heart size={18} color={isLiked ? '#EF4444' : '#64748B'} fill={isLiked ? '#EF4444' : 'transparent'} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Product Image */}
        <View className="w-full h-72 bg-slate-50 relative border-b border-slate-100">
          <Image source={{ uri: product.image }} className="w-full h-full" resizeMode="cover" />
        </View>

        <View className="p-5">
          {/* Header Specs */}
          <Text className="text-emerald-700 text-xs font-black uppercase tracking-widest mb-1">{product.category}</Text>
          <Text className="text-slate-900 text-xl font-black mb-3">{product.name}</Text>

          {/* Rating */}
          <View className="flex-row items-center mb-4">
            <Star size={16} color="#EAB308" fill="#EAB308" />
            <Text className="text-slate-800 text-sm font-extrabold ml-1">{product.rating}</Text>
            <Text className="text-slate-400 text-xs ml-1 font-semibold">({product.reviews} reviews)</Text>
            
            <View className="w-1 h-1 bg-slate-300 rounded-full mx-2.5" />
            
            <View className="bg-emerald-50 border border-emerald-100 rounded-md px-2 py-0.5">
              <Text className="text-emerald-800 text-[10px] font-bold">
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
          </View>

          {/* Pricing Row */}
          <View className="flex-row items-baseline gap-2 mb-6 border-y border-slate-50 py-4">
            <Text className="text-emerald-700 text-3xl font-black">{product.price}</Text>
            {product.originalPrice && (
              <>
                <Text className="text-slate-400 text-sm line-through font-semibold">
                  {product.originalPrice}
                </Text>
                <View className="bg-amber-100 px-2 py-0.5 rounded-md">
                  <Text className="text-amber-800 text-[9px] font-black uppercase">20% OFF</Text>
                </View>
              </>
            )}
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-slate-900 text-base font-extrabold mb-2">Description</Text>
            <Text className="text-slate-500 text-sm leading-6 font-medium">{product.description}</Text>
          </View>

          {/* Seller details */}
          <Card variant="white" className="p-4 border border-slate-100 rounded-2xl mb-6">
            <Text className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1.5">Listed By</Text>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-slate-950 font-extrabold text-sm">{product.seller}</Text>
                <Text className="text-slate-500 text-[10px] font-semibold">Verified Agriculture Dealer</Text>
              </View>
              <View className="w-7 h-7 bg-emerald-50 rounded-full items-center justify-center border border-emerald-100">
                <ShieldCheck size={14} color={FarmoraColors.primary} />
              </View>
            </View>
          </Card>

          {/* Delivery & Returns badge list */}
          <View className="space-y-3.5 mb-8 gap-3">
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl items-center justify-center">
                <Truck size={16} color="#64748B" />
              </View>
              <View>
                <Text className="text-slate-800 text-xs font-bold">Fast Local Delivery</Text>
                <Text className="text-slate-500 text-[10px] font-medium">Estimated 2-3 business days to your farm.</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl items-center justify-center">
                <RotateCcw size={16} color="#64748B" />
              </View>
              <View>
                <Text className="text-slate-800 text-xs font-bold">Easy Returns</Text>
                <Text className="text-slate-500 text-[10px] font-medium">Hassle free 7-day return on unopened packs.</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer buy action */}
      <View className="p-5 border-t border-slate-100 bg-white flex-row gap-3">
        <TouchableOpacity className="w-14 h-14 bg-slate-50 border border-slate-200 items-center justify-center rounded-2xl active:bg-slate-100">
          <ShoppingCart size={22} color="#0F172A" />
        </TouchableOpacity>
        
        <Button
          title="Buy Now"
          onPress={handleBuy}
          loading={loading}
          disabled={!product.inStock}
          style={{ flex: 1, height: 56 }}
        />
      </View>
    </View>
  );
}
