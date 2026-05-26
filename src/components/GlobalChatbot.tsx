import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Modal, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator, 
  Keyboard,
  Dimensions
} from 'react-native';
import { Bot, X, Send, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSegments } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import { FarmoraColors } from '../constants/colors';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const GlobalChatbot: React.FC = () => {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  
  // Connect to global store visibility
  const chatVisible = useAppStore((s) => s.chatVisible);
  const setChatVisible = useAppStore((s) => s.setChatVisible);
  
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome', 
      text: 'Hello! I am Farmora AI, your farming assistant. Ask me anything about crop diseases, planting schedules, or fertilizers!', 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Position FAB above tab bar dynamically
  const inTabsGroup = segments[0] === '(tabs)';
  const bottomPosition = inTabsGroup 
    ? 90 // Float above the bottom tab bar (tab bar height ~76)
    : Math.max(insets.bottom + 16, 20); // Float near the screen bottom in sub-screens

  // Scroll to bottom when messages or visibility changes
  useEffect(() => {
    if (chatVisible) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [chatVisible, messages]);

  const handleSend = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userText = chatInput.trim();
    const userMsg: Message = {
      id: `user_${Date.now()}`,
      text: userText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // Build context from previous messages (limit to 6 for speed and size)
      const contextMessages = messages
        .slice(-6)
        .map((msg) => ({
          role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: msg.text
        }));

      contextMessages.push({ role: 'user', content: userText });

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_GROQ_API_KEY || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are Farmora AI, a friendly, expert digital crop doctor and smart agriculture advisor. Help the user with crops, diseases, irrigation, weather, markets, and farming best practices. Keep replies clear, well-structured (using bullet points where appropriate), and practical. Limit responses to a few short paragraphs so it reads well on mobile screens.'
            },
            ...contextMessages
          ],
          temperature: 0.7,
          max_tokens: 512
        })
      });

      const data = await response.json();
      const botResponse = data.choices?.[0]?.message?.content || "I'm sorry, I encountered an issue retrieving an answer. Let's try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          text: botResponse,
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Groq AI API Call Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          text: 'I apologize, I could not connect to my knowledge base. Please check your internet connection and try again.',
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Action Button */}
      {!chatVisible && (
        <TouchableOpacity
          onPress={() => setChatVisible(true)}
          style={{
            position: 'absolute',
            bottom: bottomPosition,
            right: 20,
            backgroundColor: '#044e27', // dark green matching design
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 24,
            shadowColor: '#166534',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.28,
            shadowRadius: 10,
            elevation: 8,
            zIndex: 999,
            gap: 6
          }}
          activeOpacity={0.85}
        >
          <Sparkles size={16} color="white" />
          <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>
            Ask Farmora AI
          </Text>
        </TouchableOpacity>
      )}

      {/* Chat Interface Modal */}
      <Modal
        visible={chatVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setChatVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, backgroundColor: 'rgba(22, 29, 22, 0.45)', justifyContent: 'flex-end' }}
        >
          <View 
            style={{ 
              backgroundColor: '#ffffff', 
              borderTopLeftRadius: 32, 
              borderTopRightRadius: 32, 
              paddingTop: 20,
              paddingHorizontal: 20,
              paddingBottom: Math.max(insets.bottom, 16),
              height: '75%', 
              width: '100%',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 24
            }}
          >
            {/* Modal Header */}
            <View 
              style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottomWidth: 1, 
                borderColor: '#f1f5f0', 
                paddingBottom: 16 
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View 
                  style={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: 20, 
                    backgroundColor: '#e6f4ea', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  <Bot size={22} color={FarmoraColors.primary} />
                </View>
                <View>
                  <Text style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: '800', color: FarmoraColors.textDark }}>
                    Farmora Crop AI
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' }} />
                    <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '600', color: FarmoraColors.primary }}>
                      AI Assistant Online
                    </Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity 
                onPress={() => setChatVisible(false)} 
                style={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: 16, 
                  backgroundColor: '#f1f5f9', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Chat Messages */}
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 16, gap: 12 }}
              style={{ flex: 1 }}
              renderItem={({ item }) => {
                const isBot = item.sender === 'bot';
                return (
                  <View style={{ flexDirection: 'row', justifyContent: isBot ? 'flex-start' : 'flex-end' }}>
                    {isBot && (
                      <View style={{ marginRight: 8, marginTop: 4 }}>
                        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#e6f4ea', alignItems: 'center', justifyContent: 'center' }}>
                          <Bot size={14} color={FarmoraColors.primary} />
                        </View>
                      </View>
                    )}
                    <View 
                      style={{
                        backgroundColor: isBot ? '#f0fdf4' : FarmoraColors.primary,
                        borderTopLeftRadius: 18,
                        borderTopRightRadius: 18,
                        borderBottomLeftRadius: isBot ? 4 : 18,
                        borderBottomRightRadius: isBot ? 18 : 4,
                        maxWidth: '82%',
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderWidth: isBot ? 1 : 0,
                        borderColor: '#e2ecd9'
                      }}
                    >
                      <Text 
                        style={{ 
                          fontFamily: 'Inter', 
                          fontSize: 13, 
                          color: isBot ? FarmoraColors.textDark : '#ffffff', 
                          lineHeight: 18,
                          fontWeight: isBot ? '500' : '600'
                        }}
                      >
                        {item.text}
                      </Text>
                      <Text 
                        style={{ 
                          fontSize: 8, 
                          color: isBot ? '#94a3b8' : '#a7f3d0', 
                          alignSelf: 'flex-end', 
                          marginTop: 4,
                          fontWeight: '500'
                        }}
                      >
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />

            {/* Input Row */}
            <View 
              style={{ 
                flexDirection: 'row', 
                gap: 10, 
                borderTopWidth: 1, 
                borderColor: '#f1f5f0', 
                paddingTop: 12, 
                alignItems: 'center' 
              }}
            >
              <View 
                style={{ 
                  flex: 1, 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  backgroundColor: '#f8faf7', 
                  borderWidth: 1, 
                  borderColor: '#e8f0e4', 
                  borderRadius: 24, 
                  paddingHorizontal: 16,
                  height: 48
                }}
              >
                <TextInput
                  placeholder="Ask crop doctor..."
                  placeholderTextColor="#94a3b8"
                  value={chatInput}
                  onChangeText={setChatInput}
                  onSubmitEditing={handleSend}
                  style={{ 
                    flex: 1, 
                    color: '#1e293b', 
                    fontSize: 13, 
                    fontFamily: 'Inter', 
                    height: '100%',
                    paddingVertical: 0
                  }}
                />
                {isLoading && (
                  <ActivityIndicator size="small" color={FarmoraColors.primary} style={{ marginLeft: 8 }} />
                )}
              </View>
              
              <TouchableOpacity 
                onPress={handleSend}
                disabled={isLoading}
                style={{ 
                  backgroundColor: FarmoraColors.primary, 
                  width: 48, 
                  height: 48, 
                  borderRadius: 24, 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  opacity: isLoading || !chatInput.trim() ? 0.75 : 1
                }}
                activeOpacity={0.8}
              >
                <Send size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};
