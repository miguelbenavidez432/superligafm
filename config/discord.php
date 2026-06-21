<?php

return [
    'webhooks' => [
        'notifications' => [
            'default' => env('DISCORD_WEBHOOK_NOTIFICATIONS_URL'),

            'formats' => [
                'PD' => env('DISCORD_WEBHOOK_NOTIFICATIONS_PRIMERA'),
                'SD' => env('DISCORD_WEBHOOK_NOTIFICATIONS_SEGUNDA'),
                'CopaFM' => env('DISCORD_WEBHOOK_NOTIFICATIONS_COPAFM'),
                'UCL' => env('DISCORD_WEBHOOK_NOTIFICATIONS_CHAMPIONS'),
                'UEL' => env('DISCORD_WEBHOOK_NOTIFICATIONS_EUROPA'),
            ],
        ],

        'rescissions' => [
            'default' => env('DISCORD_WEBHOOK_URL'),
        ],

        'transfers' => [
            'default' => env('DISCORD_WEBHOOK_TRANSFERS'),
        ],

        'auctions' => [
            'default' => env('DISCORD_WEBHOOK_AUCTIONS'),
        ],

        'avisos' => [
            'default' => env('DISCORD_WEBHOOK_NOTIFICATIONS_URL'),
        ],

        'transferibles' => [
            'default' => env('DISCORD_WEBHOOK_TRANSFERIBLES'),
        ],

        'sanctions' => [
            'default' => env('DISCORD_WEBHOOK_SANCTIONS'),
        ],

        'agent' => [
            'default' => env('DISCORD_AGENT_WEBHOOK'),
        ],
    ],

    'secret' => env('DISCORD_WEBHOOK_SECRET'),
];
