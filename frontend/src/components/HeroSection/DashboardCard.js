import "./DashboardCard.css";

import CountUp from "react-countup";

import {
    Wallet,
    TrendingUp,
    Bell,
    ArrowUpCircle,
    ArrowDownCircle
} from "lucide-react";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

const chartData = [
    { month: "Jan", spending: 18000 },
    { month: "Feb", spending: 24000 },
    { month: "Mar", spending: 21000 },
    { month: "Apr", spending: 32000 },
    { month: "May", spending: 27000 },
    { month: "Jun", spending: 39000 }
];

export default function DashboardCard() {

    return (

        <div className="hero-dashboard-card">

            <div className="dashboard-top">

                <div className="dashboard-brand">

                    <Wallet size={22}/>

                    <span>FINOVA</span>

                </div>

                <Bell size={20}/>

            </div>

            <div className="balance-section">

                <p>Total Balance</p>

                <h2>

                    ₹

                    <CountUp
                        end={128540}
                        duration={2}
                        separator=","
                    />

                </h2>

                <div className="growth">

                    <TrendingUp size={18}/>

                    <span>8.4% this month</span>

                </div>

            </div>

            <div className="chart-container">

                <h4>Monthly Spending</h4>

                <ResponsiveContainer width="100%" height={220}>

                    <LineChart data={chartData}>

                        <CartesianGrid
                            stroke="#222"
                            strokeDasharray="3 3"
                        />

                        <XAxis
                            dataKey="month"
                            stroke="#777"
                        />

                        <Tooltip />

                        <Line
                            type="monotone"
                            dataKey="spending"
                            stroke="#22C55E"
                            strokeWidth={4}
                            dot={{
                                r:5,
                                fill:"#22C55E"
                            }}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>

            <div className="mini-cards">

                <div>

                    <ArrowUpCircle/>

                    <span>Income</span>

                    <h4>₹52,000</h4>

                </div>

                <div>

                    <ArrowDownCircle/>

                    <span>Expense</span>

                    <h4>₹18,000</h4>

                </div>

                <div>

                    <Wallet/>

                    <span>Savings</span>

                    <h4>₹34,000</h4>

                </div>

            </div>

            <div className="transactions">

                <h4>Recent Transactions</h4>

                <div>

                    <span>Netflix</span>

                    <p>-₹799</p>

                </div>

                <div>

                    <span>Salary</span>

                    <p className="green">

                        +₹52,000

                    </p>

                </div>

                <div>

                    <span>Shopping</span>

                    <p>-₹1,250</p>

                </div>

                <div>

                    <span>Spotify</span>

                    <p>-₹119</p>

                </div>

            </div>

        </div>

    );

}