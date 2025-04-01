import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store'; // 导入 store 和 persistor
import AppNavigator from './src/navigation/AppNavigator'; // 假设这是你的主导航/UI
import { ActivityIndicator, View } from 'react-native'; // 用于加载指示器

const App = () => {
    return (
        <Provider store={store}>
            {/* PersistGate 包裹你的主应用 */}
            <PersistGate loading={<LoadingIndicator />} persistor={persistor}>
                {/* 你的应用主组件 */}
                <AppNavigator />
            </PersistGate>
        </Provider>
    );
};

// 一个简单的加载指示器组件
const LoadingIndicator = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
    </View>
);

export default App;