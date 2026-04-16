'use client'

import React from 'react';
import { Card, CardContent } from "@heroui/react";
import { TrendingUp, TrendingDown, Activity, ShieldCheck, PieChart } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string;
    change?: string;
    isPositive?: boolean;
    icon?: 'price' | 'sharpe' | 'drawdown' | 'winrate';
}

const icons = {
    price: <Activity className="text-primary" />,
    sharpe: <TrendingUp className="text-secondary" />,
    drawdown: <ShieldCheck className="text-danger" />,
    winrate: <PieChart className="text-success" />,
};

export const KPICard = ({ title, value, change, isPositive, icon }: KPICardProps) => {
    return (
        <Card className="bg-default-100/10 border-none hover:bg-default-100/20 transition-all cursor-pointer">
            <CardContent className="p-4 flex flex-row items-center gap-4">
                <div className="p-3 rounded-xl bg-default-200/20">
                    {icon ? icons[icon] : <Activity />}
                </div>
                <div className="flex flex-col">
                    <p className="text-tiny text-default-500 uppercase font-bold">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-xl font-bold">{value}</h4>
                        {change && (
                            <span className={`text-tiny font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
                                {change}
                            </span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
