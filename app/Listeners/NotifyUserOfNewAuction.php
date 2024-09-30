<?php

namespace App\Listeners;

use App\Events\NewAuctionEvent;
use App\Models\User;
use App\Notifications\NewAuctionNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class NotifyUserOfNewAuction
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(NewAuctionEvent $event)
    {
        $auction = $event->auction;
        $users = User::whereHas('bids', function ($query) use ($auction) {
            $query->where('auction_id', $auction->id);
        })->get();

        foreach ($users as $user) {
            $user->notify(new NewAuctionNotification($auction));
        }
    }
}
