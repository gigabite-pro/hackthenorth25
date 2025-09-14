import { useState } from "react";

export default function Redeem({ onBack, userCoins, onRedeemSuccess }) {
    const [redeeming, setRedeeming] = useState(null);

    const redeemOffers = [
        {
            id: 1,
            brand: "Tim Hortons",
            offer: "Free Double-Double Coffee",
            description: "Enjoy Canada's favorite coffee on us!",
            cost: 150,
            emoji: "☕",
            color: "#D4202A"
        },
        {
            id: 2,
            brand: "Canadian Tire",
            offer: "$10 Off Purchase",
            description: "Save on tools, automotive, and home goods",
            cost: 300,
            emoji: "🔧",
            color: "#E31E24"
        },
        {
            id: 3,
            brand: "Loblaws",
            offer: "$15 Grocery Credit",
            description: "Fresh groceries and essentials discount",
            cost: 450,
            emoji: "🛒",
            color: "#00A651"
        },
        {
            id: 4,
            brand: "Shoppers Drug Mart",
            offer: "20% Off Beauty Products",
            description: "Skincare, makeup, and wellness items",
            cost: 200,
            emoji: "💄",
            color: "#E4002B"
        },
        {
            id: 5,
            brand: "Metro",
            offer: "$20 Food Credit",
            description: "Quality groceries and fresh produce",
            cost: 600,
            emoji: "🥬",
            color: "#0066CC"
        },
        {
            id: 6,
            brand: "Boston Pizza",
            offer: "Free Appetizer",
            description: "Choose any starter with main course purchase",
            cost: 250,
            emoji: "🍕",
            color: "#C8102E"
        },
        {
            id: 7,
            brand: "The Bay",
            offer: "$25 Fashion Discount",
            description: "Clothing, accessories, and home decor",
            cost: 750,
            emoji: "👗",
            color: "#000000"
        },
        {
            id: 8,
            brand: "Cineplex",
            offer: "Free Movie Ticket",
            description: "Any regular 2D movie showing",
            cost: 400,
            emoji: "🎬",
            color: "#8B1538"
        }
    ];

    const handleRedeem = async (offer) => {
        if (userCoins < offer.cost) {
            alert(`Insufficient coins! You need ${offer.cost} coins but only have ${userCoins}.`);
            return;
        }

        setRedeeming(offer.id);
        
        // Simulate API call
        setTimeout(() => {
            if (onRedeemSuccess) {
                onRedeemSuccess(offer.cost);
            }
            setRedeeming(null);
            alert(`Successfully redeemed: ${offer.offer} from ${offer.brand}!`);
        }, 1500);
    };

    return (
        <main className="content">
            <div className="redeem-header">
                <button className="ghost-btn" onClick={onBack}>
                    ← Back to Dashboard
                </button>
                <div className="redeem-title">
                    <h1>🪙 Redeem Coins</h1>
                    <p>You have <strong>{userCoins} coins</strong> to spend</p>
                </div>
            </div>

            <section className="redeem-grid" aria-label="Redemption offers">
                {redeemOffers.map((offer) => (
                    <div
                        key={offer.id}
                        className="redeem-card"
                    >
                        <div className="redeem-card-header">
                            <span className="redeem-emoji">{offer.emoji}</span>
                            <div className="redeem-brand">{offer.brand}</div>
                        </div>
                        
                        <div className="redeem-card-body">
                            <h3 className="redeem-offer">{offer.offer}</h3>
                            <p className="redeem-description">{offer.description}</p>
                        </div>

                        <div className="redeem-card-footer">
                            <div className="redeem-cost">
                                <span className="cost-label">Cost:</span>
                                <span className="cost-value">{offer.cost} coins</span>
                            </div>
                            <button
                                className={`redeem-btn ${userCoins < offer.cost ? 'disabled' : ''}`}
                                onClick={() => handleRedeem(offer)}
                                disabled={userCoins < offer.cost || redeeming === offer.id}
                            >
                                {redeeming === offer.id ? 'Redeeming...' : 'Redeem'}
                            </button>
                        </div>
                    </div>
                ))}
            </section>
        </main>
    );
}
