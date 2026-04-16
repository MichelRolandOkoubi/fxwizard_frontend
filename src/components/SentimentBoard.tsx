'use client'

import React from 'react';
import { Card, CardContent, ProgressBar, Chip } from "@heroui/react";

interface Sentiment {
    symbol: string;
    score: number; // -1 to 1
    trend: 'Bullish' | 'Bearish' | 'Neutral';
    price?: number;
}

interface SentimentBoardProps {
    sentiments: Sentiment[];
}

export const SentimentBoard = ({ sentiments }: SentimentBoardProps) => {
    return (
        <Card className="bg-default-100/10 border-none h-full">
            <CardContent className="p-4 flex flex-col gap-4">
                <h3 className="text-lg font-bold">Live Market Sentiment</h3>
                <div className="flex flex-col gap-4">
                    {sentiments.map((s) => (
                        <div key={s.symbol} className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-small">
                                <span className="font-bold">{s.symbol}</span>
                                <Chip
                                    color={s.trend === 'Bullish' ? 'success' : (s.trend === 'Bearish' ? 'danger' : 'default')}
                                    variant="soft"
                                    size="sm"
                                >
                                    {s.trend}
                                </Chip>
                            </div>
                            <ProgressBar
                                color={s.trend === 'Bullish' ? 'success' : (s.trend === 'Bearish' ? 'danger' : 'default')}
                                size="sm"
                                value={((s.score + 1) / 2) * 100}
                                className="max-w-md"
                                aria-label={`${s.symbol} sentiment score`}
                            />
                        </div>
                    ))}
                </div>

                <div className="mt-auto p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-tiny text-primary-400 font-medium italic">
                        "Sentiment is shifting towards bullish for major pairs. ATR levels indicate high volatility."
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
