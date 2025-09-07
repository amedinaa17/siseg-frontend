import { Colors } from '@/theme/colors';
import { Slot } from "expo-router";
import React from 'react';
import { View } from "react-native";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
            <Slot />
        </View>
    );
};

export default AdminLayout;
