import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiMinus, FiInfo, FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';

const AttendanceCard = () => {
    // Load values from localStorage or default to 23 attended out of 28 held (82%)
    const [attended, setAttended] = useState(() => {
        const saved = localStorage.getItem('attendance_attended');
        return saved !== null ? parseInt(saved, 10) : 23;
    });
    const [held, setHeld] = useState(() => {
        const saved = localStorage.getItem('attendance_held');
        return saved !== null ? parseInt(saved, 10) : 28;
    });

    useEffect(() => {
        localStorage.setItem('attendance_attended', attended.toString());
    }, [attended]);

    useEffect(() => {
        localStorage.setItem('attendance_held', held.toString());
    }, [held]);

    const percentage = held > 0 ? (attended / held) * 100 : 0;
    const roundedPercentage = Math.round(percentage);
    const percentageFormatted = percentage.toFixed(1);

    // Calculates number of consecutive classes needed to reach target percentage
    const getClassesNeeded = (target) => {
        if (held === 0) return 0;
        if (Math.round((attended / held) * 100) >= target) return 0;
        let x = 0;
        while (Math.round(((attended + x) / (held + x)) * 100) < target) {
            x++;
        }
        return x;
    };

    // Calculates number of classes that can be bunked to stay at/above target percentage
    const getClassesCanBunk = (target) => {
        if (held === 0 || Math.round((attended / held) * 100) < target) return 0;
        let y = 0;
        while (Math.round((attended / (held + y + 1)) * 100) >= target) {
            y++;
        }
        return y;
    };

    const need75 = getClassesNeeded(75);
    const bunk75 = getClassesCanBunk(75);
    const need85 = getClassesNeeded(85);
    const bunk85 = getClassesCanBunk(85);

    // SVG Circular Progress config
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (Math.min(100, percentage) / 100) * circumference;

    const handleAttendedChange = (val) => {
        const nextVal = Math.max(0, val);
        if (nextVal <= held) {
            setAttended(nextVal);
        }
    };

    const handleHeldChange = (val) => {
        const nextVal = Math.max(0, val);
        setHeld(nextVal);
        if (attended > nextVal) {
            setAttended(nextVal);
        }
    };

    // Color theme helper based on attendance status
    const getStatusDetails = () => {
        if (percentage >= 75) {
            return {
                text: 'text-emerald-600 dark:text-emerald-400',
                stroke: 'stroke-emerald-500 dark:stroke-emerald-400',
                bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30',
                label: 'On Track',
                icon: FiCheckCircle
            };
        }
        if (percentage >= 65) {
            return {
                text: 'text-amber-600 dark:text-amber-400',
                stroke: 'stroke-amber-500 dark:stroke-amber-400',
                bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30',
                label: 'Warning',
                icon: FiAlertTriangle
            };
        }
        return {
            text: 'text-red-600 dark:text-red-400',
            stroke: 'stroke-red-500 dark:stroke-red-400',
            bg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30',
            label: 'Shortage',
            icon: FiXCircle
        };
    };

    const status = getStatusDetails();
    const StatusIcon = status.icon;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">📊 Attendance</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Track and calculate your attendance requirements</p>
                </div>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${status.bg} ${status.text} flex items-center gap-1`}>
                    <StatusIcon className="w-3 h-3" /> {status.label}
                </span>
            </div>

            {/* Gauge and Counters Grid */}
            <div className="grid grid-cols-5 gap-4 items-center">
                {/* SVG Progress Circle */}
                <div className="col-span-2 flex flex-col items-center justify-center relative">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            {/* Gradient definition for glow */}
                            <defs>
                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#06b6d4" />
                                </linearGradient>
                            </defs>
                            {/* Track Circle */}
                            <circle
                                cx="56"
                                cy="56"
                                r={radius}
                                className="stroke-slate-100 dark:stroke-slate-800"
                                strokeWidth="8"
                                fill="transparent"
                            />
                            {/* Progress Circle */}
                            <motion.circle
                                cx="56"
                                cy="56"
                                r={radius}
                                className={percentage >= 75 ? status.stroke : "stroke-[url(#progressGradient)]"}
                                strokeWidth="8"
                                fill="transparent"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                        </svg>
                        {/* Percentage Text inside Circle */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-black text-slate-900 dark:text-slate-100">{percentageFormatted}%</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">attended</span>
                        </div>
                    </div>
                </div>

                {/* Interactive adjusters */}
                <div className="col-span-3 space-y-3">
                    {/* Attended adjuster */}
                    <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Attended</span>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => handleAttendedChange(attended - 1)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                            >
                                <FiMinus className="w-3.5 h-3.5" />
                            </button>
                            <input
                                type="number"
                                value={attended}
                                onChange={(e) => handleAttendedChange(parseInt(e.target.value, 10) || 0)}
                                className="w-12 text-center text-sm font-bold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                                onClick={() => handleAttendedChange(attended + 1)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                            >
                                <FiPlus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Held adjuster */}
                    <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Classes Held</span>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => handleHeldChange(held - 1)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                            >
                                <FiMinus className="w-3.5 h-3.5" />
                            </button>
                            <input
                                type="number"
                                value={held}
                                onChange={(e) => handleHeldChange(parseInt(e.target.value, 10) || 0)}
                                className="w-12 text-center text-sm font-bold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                                onClick={() => handleHeldChange(held + 1)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                            >
                                <FiPlus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calculations Card */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 border border-slate-100 dark:border-slate-800/50 space-y-2.5">
                {/* 75% Target */}
                <div className="flex items-center justify-between text-xs border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Target 75%</span>
                    {roundedPercentage >= 75 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Safe! Can bunk <strong className="font-black text-sm">{bunk75}</strong> more classes
                        </span>
                    ) : (
                        <span className="text-red-500 dark:text-red-400 font-medium">
                            Need <strong className="font-black text-sm">{need75}</strong> more classes
                        </span>
                    )}
                </div>

                {/* 85% Target */}
                <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Target 85%</span>
                    {roundedPercentage >= 85 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Safe! Can bunk <strong className="font-black text-sm">{bunk85}</strong> more classes
                        </span>
                    ) : (
                        <span className="text-blue-500 dark:text-blue-400 font-medium">
                            Need <strong className="font-black text-sm">{need85}</strong> more classes
                        </span>
                    )}
                </div>
            </div>

            {/* Mini Tip */}
            <div className="flex items-start gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                <FiInfo className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>Calculations assume subsequent classes are attended consecutively to reach targets.</span>
            </div>
        </div>
    );
};

export default AttendanceCard;
