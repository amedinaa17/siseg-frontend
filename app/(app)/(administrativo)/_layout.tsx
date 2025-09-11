import { Colores } from '@/temas/colores';
import { Slot } from "expo-router";
import React from 'react';
import { View } from "react-native";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <View style={{ flex: 1, backgroundColor: Colores.fondo }}>
            <Slot />
        </View>
    );
};

export default AdminLayout;
