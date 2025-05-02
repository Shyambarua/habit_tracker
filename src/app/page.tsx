"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Bell,
  Smartphone,
  Award,
  CheckCircle,
  Calendar,
  TrendingUp,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";

// Define interfaces for type safety
interface HabitDay {
  day: string;
  value: number;
}

interface DayData {
  name: string;
  [key: string]: number | string; // Allow any habit name as a key
}

type ActiveTab = "dashboard" | "add" | "settings" | "details";
type ActivePage = "landing" | "tracker";

interface Habit {
  id: number;
  name: string;
  iconName: string; // Changed from icon: React.ReactNode to iconName: string
  unit: string;
  target: number;
  current: number;
  color: string;
  streak: number;
  history: HabitDay[];
}

interface LoginForm {
  email: string;
  password: string;
}

// Custom icons moved to a component
const HabitIcon = ({ name }: { name: string }) => {
  switch (name) {
    case "water":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v6m0 0l-4 8a4 4 0 0 0 8 0l-4-8z" />
        </svg>
      );
    case "moon":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      );
    case "smartphone":
      return <Smartphone />;
    default:
      return <CheckCircle />;
  }
};

// Initial habit data with some sample history
const initialHabits: Habit[] = [
  {
    id: 1,
    name: "Sleep",
    iconName: "moon",
    unit: "hours",
    target: 8,
    current: 7.5,
    color: "#6366F1",
    streak: 3,
    history: [
      { day: "Mon", value: 7.0 },
      { day: "Tue", value: 6.5 },
      { day: "Wed", value: 8.0 },
      { day: "Thu", value: 7.5 },
      { day: "Fri", value: 7.5 },
      { day: "Sat", value: 8.5 },
      { day: "Sun", value: 7.5 },
    ],
  },
  {
    id: 2,
    name: "Water",
    iconName: "water",
    unit: "glasses",
    target: 8,
    current: 6,
    color: "#60A5FA",
    streak: 5,
    history: [
      { day: "Mon", value: 6 },
      { day: "Tue", value: 8 },
      { day: "Wed", value: 7 },
      { day: "Thu", value: 5 },
      { day: "Fri", value: 6 },
      { day: "Sat", value: 4 },
      { day: "Sun", value: 6 },
    ],
  },
  {
    id: 3,
    name: "Screen Time",
    iconName: "smartphone",
    unit: "hours",
    target: 2,
    current: 3.5,
    color: "#F87171",
    streak: 0,
    history: [
      { day: "Mon", value: 2.5 },
      { day: "Tue", value: 1.5 },
      { day: "Wed", value: 3.0 },
      { day: "Thu", value: 4.0 },
      { day: "Fri", value: 3.5 },
      { day: "Sat", value: 5.0 },
      { day: "Sun", value: 3.5 },
    ],
  },
];

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [activePage, setActivePage] = useState<ActivePage>("landing");
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [newHabit, setNewHabit] = useState({
    name: "",
    unit: "",
    target: 1,
    color: "#60A5FA",
  });
  const [showReminder, setShowReminder] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [carouselText] = useState([
    { text: "Transform Your Habits", color: "from-indigo-600 to-purple-600" },
    { text: "Track Your Progress", color: "from-blue-600 to-indigo-600" },
    { text: "Achieve Your Goals", color: "from-purple-600 to-pink-600" },
  ]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedHabits = localStorage.getItem("habits");
    if (savedHabits) {
      try {
        setHabits(JSON.parse(savedHabits));
      } catch (e) {
        console.error("Failed to parse saved habits:", e);
      }
    }
  }, []);

  // Save to localStorage whenever habits change
  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  // Show reminder notification effect
  useEffect(() => {
    // Show reminder notification after 15 seconds as demo
    const timer = setTimeout(() => {
      setShowReminder(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % carouselText.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [carouselText.length]);

  const updateHabitValue = (id: number, value: number) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id === id) {
          // Calculate streak
          let newStreak = habit.streak;
          if (habit.name === "Screen Time") {
            // For screen time, under target is good
            if (value <= habit.target) {
              newStreak += 1;
            } else {
              newStreak = 0;
            }
          } else {
            // For other habits, over target is good
            if (value >= habit.target) {
              newStreak += 1;
            } else {
              newStreak = 0;
            }
          }

          // Update today's history
          const newHistory = [...habit.history];
          newHistory[newHistory.length - 1] = {
            ...newHistory[newHistory.length - 1],
            value: value,
          };

          return {
            ...habit,
            current: value,
            streak: newStreak,
            history: newHistory,
          };
        }
        return habit;
      })
    );
  };

  const addNewHabit = () => {
    if (!newHabit.name) return;

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const emptyHistory = days.map((day) => ({ day, value: 0 }));

    const habit: Habit = {
      id: Date.now(),
      name: newHabit.name,
      iconName: "check-circle",
      unit: newHabit.unit || "units",
      target: Number(newHabit.target) || 1,
      current: 0,
      color: newHabit.color,
      streak: 0,
      history: emptyHistory,
    };

    setHabits((prev) => [...prev, habit]);
    setNewHabit({ name: "", unit: "", target: 1, color: "#60A5FA" });
    setActiveTab("dashboard"); // Switch back to dashboard after adding
  };

  const dismissReminder = () => {
    setShowReminder(false);
  };

  const viewHabitDetails = (habit: Habit) => {
    setSelectedHabit(habit);
    setActiveTab("details");
  };

  const closeHabitDetails = () => {
    setSelectedHabit(null);
    setActiveTab("dashboard");
  };

  const calculateProgress = (habit: Habit) => {
    if (habit.name === "Screen Time") {
      // For screen time, less is better
      const progress = Math.max(0, 1 - habit.current / habit.target);
      return Math.min(progress, 1) * 100;
    } else {
      // For other habits, more is better
      const progress = habit.current / habit.target;
      return Math.min(progress, 1) * 100;
    }
  };

  const formatValue = (habit: Habit) => {
    if (habit.unit === "hours") {
      const hours = Math.floor(habit.current);
      const minutes = Math.round((habit.current - hours) * 60);
      if (minutes === 0) {
        return `${hours} hr`;
      }
      return `${hours}h ${minutes}m`;
    }
    return `${habit.current} ${habit.unit}`;
  };

  const calculateWeeklyAverage = (habit: Habit) => {
    const sum = habit.history.reduce(
      (acc: number, day: HabitDay) => acc + day.value,
      0
    );
    return (sum / 7).toFixed(1);
  };

  // Fix HTML escaping in strings
  const strings = {
    todayCheckIn: "Today's Check-in",
  };

  const handleTargetChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setNewHabit({ ...newHabit, target: value || 1 });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setActivePage("tracker");
    setShowSignInModal(false);
  };

  const SignInModal = () => (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowSignInModal(false)}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowSignInModal(false);
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
          Welcome Back
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLogin(e);
          }}
          className="space-y-6"
        >
          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={loginForm.email}
              onChange={(e) => {
                e.stopPropagation();
                setLoginForm({ ...loginForm, email: e.target.value });
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={loginForm.password}
              onChange={(e) => {
                e.stopPropagation();
                setLoginForm({ ...loginForm, password: e.target.value });
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            onClick={(e) => e.stopPropagation()}
            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
          Don&apos;t have an account?{" "}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSignInModal(true);
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => viewHabitDetails(habit)}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">
                  <HabitIcon name={habit.iconName} />
                </span>
                <h3 className="font-semibold">{habit.name}</h3>
              </div>
              <span className="text-sm font-medium text-gray-500">
                {habit.target} {habit.unit}/day
              </span>
            </div>

            <div className="mb-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${calculateProgress(habit)}%`,
                  backgroundColor: habit.color,
                }}
              ></div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span className="text-xl font-bold">{formatValue(habit)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Award size={16} className="text-yellow-500" />
                <span className="font-semibold text-sm">
                  {habit.streak} day streak
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="mr-2" />
          Weekly Progress
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[...Array(7).keys()].map((i) => {
                const dayData: DayData = {
                  name: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
                };
                habits.forEach((habit) => {
                  dayData[habit.name] = habit.history[i]?.value || 0;
                });
                return dayData;
              })}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {habits.map((habit) => (
                <Line
                  key={habit.id}
                  type="monotone"
                  dataKey={habit.name}
                  stroke={habit.color}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar className="mr-2" />
          {strings.todayCheckIn}
        </h2>
        <div className="space-y-4">
          {habits.map((habit) => (
            <div key={habit.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span style={{ color: habit.color }}>
                    <HabitIcon name={habit.iconName} />
                  </span>
                  <span className="font-medium">{habit.name}</span>
                </div>
                <span className="text-sm">
                  {formatValue(habit)} / {habit.target} {habit.unit}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max={habit.unit === "hours" ? "12" : "20"}
                  step={habit.unit === "hours" ? "0.5" : "1"}
                  value={habit.current}
                  onChange={(e) =>
                    updateHabitValue(habit.id, parseFloat(e.target.value))
                  }
                  className="w-full accent-blue-500"
                />
                <span
                  className="w-16 text-center font-semibold"
                  style={{ color: habit.color }}
                >
                  {formatValue(habit)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderHabitForm = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
      <h2 className="text-lg font-semibold mb-4">Add New Habit</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Habit Name
          </label>
          <input
            type="text"
            value={newHabit.name}
            onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
            placeholder="e.g., Exercise, Meditation"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Unit
            </label>
            <input
              type="text"
              value={newHabit.unit}
              onChange={(e) =>
                setNewHabit({ ...newHabit, unit: e.target.value })
              }
              placeholder="e.g., hours, glasses, times"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Daily Target
            </label>
            <input
              type="number"
              value={newHabit.target}
              onChange={handleTargetChange}
              min="1"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Color
          </label>
          <div className="flex space-x-2">
            {["#6366F1", "#60A5FA", "#34D399", "#F87171", "#FBBF24"].map(
              (color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full ${
                    newHabit.color === color
                      ? "ring-2 ring-offset-2 ring-blue-500"
                      : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewHabit({ ...newHabit, color })}
                />
              )
            )}
          </div>
        </div>

        <button
          onClick={addNewHabit}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Habit
        </button>
      </div>
    </div>
  );

  const renderHabitDetails = () => {
    if (!selectedHabit) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={closeHabitDetails}
            className="text-blue-500 hover:text-blue-700 flex items-center"
          >
            ← Back
          </button>
          <h2 className="text-xl font-bold flex items-center">
            <span style={{ color: selectedHabit.color }} className="mr-2">
              <HabitIcon name={selectedHabit.iconName} />
            </span>
            {selectedHabit.name}
          </h2>
          <div></div> {/* Empty div for flex alignment */}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Current</p>
              <p className="text-xl font-bold">{formatValue(selectedHabit)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Target</p>
              <p className="text-xl font-bold">
                {selectedHabit.target} {selectedHabit.unit}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Streak</p>
              <p className="text-xl font-bold flex items-center justify-center">
                <Award size={16} className="text-yellow-500 mr-1" />
                {selectedHabit.streak} days
              </p>
            </div>
          </div>

          <h3 className="font-semibold mb-2">Weekly Performance</h3>
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={selectedHabit.history}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={selectedHabit.color} />
                <ReferenceLine
                  y={selectedHabit.target}
                  stroke="#666"
                  strokeDasharray="3 3"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <p className="text-sm text-gray-500">Weekly Average</p>
                  <p className="text-lg font-bold">
                    {calculateWeeklyAverage(selectedHabit)} {selectedHabit.unit}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <p className="text-sm text-gray-500">Progress</p>
                  <p className="text-lg font-bold">
                    {calculateProgress(selectedHabit).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{strings.todayCheckIn}</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max={selectedHabit.unit === "hours" ? "12" : "20"}
                  step={selectedHabit.unit === "hours" ? "0.5" : "1"}
                  value={selectedHabit.current}
                  onChange={(e) =>
                    updateHabitValue(
                      selectedHabit.id,
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full accent-blue-500"
                />
                <span
                  className="w-16 text-center font-semibold"
                  style={{ color: selectedHabit.color }}
                >
                  {formatValue(selectedHabit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Settings className="mr-2" />
        Settings
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Notifications</h3>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" defaultChecked />
            <span>Daily reminders</span>
          </label>
        </div>

        <div>
          <h3 className="font-medium mb-2">Manage Habits</h3>
          <div className="space-y-2">
            {habits.map((habit: Habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between py-2 border-b"
              >
                <div className="flex items-center">
                  <span style={{ color: habit.color }} className="mr-2">
                    <HabitIcon name={habit.iconName} />
                  </span>
                  <span>{habit.name}</span>
                </div>
                <button
                  className="text-red-500 text-sm hover:text-red-700"
                  onClick={() => {
                    if (confirm(`Delete ${habit.name}?`)) {
                      setHabits((prev: Habit[]) =>
                        prev.filter((h: Habit) => h.id !== habit.id)
                      );
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Data Management</h3>
          <button
            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
            onClick={() => {
              if (confirm("Reset all data? This cannot be undone.")) {
                localStorage.removeItem("habits");
                setHabits(initialHabits);
              }
            }}
          >
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
      {showSignInModal && <SignInModal />}
      {activePage === "landing" ? (
        // Landing page content
        <div className="flex-grow">
          {/* Header */}
          <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow py-4 fixed w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <h1 className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400">
                Personal Analytics & Habit Tracker
              </h1>
              <button
                onClick={() => setShowSignInModal(true)}
                className="px-4 sm:px-6 py-2 bg-indigo-600 text-white text-sm sm:text-base font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          </header>

          {/* Hero Section */}
          <section
            className={`bg-gradient-to-r ${carouselText[currentTextIndex].color} text-white py-16 sm:py-20 min-h-[60vh] flex items-center transition-colors duration-500`}
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                  className="max-w-2xl mx-auto"
                >
                  <motion.h1
                    key={currentTextIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
                  >
                    {carouselText[currentTextIndex].text}
                  </motion.h1>
                  <p className="text-base sm:text-lg mb-8">
                    Monitor your daily habits, visualize your progress, and
                    build better routines with our powerful analytics tools.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSignInModal(true)}
                    className="px-6 sm:px-8 py-3 bg-white text-indigo-600 font-medium rounded-md shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Start Tracking Now
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 sm:py-20 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center mb-12 sm:mb-16"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">
                  Why Choose Our Habit Tracker?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4 sm:px-0">
                  Our intuitive app helps you build better habits through
                  data-driven insights and motivational tools.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700"
                >
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <i className="fas fa-chart-line text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-center text-gray-800 dark:text-white">
                    📊 Habit Progress Graphs
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center">
                    Visualize your progress over time with interactive charts
                    and detailed analytics.
                  </p>
                </motion.div>

                {/* Feature 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700"
                >
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <i className="fas fa-check-circle text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-center text-gray-800 dark:text-white">
                    ✅ Daily Check-in & Goals
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center">
                    Set personal goals and track your daily progress with
                    easy-to-use check-in tools.
                  </p>
                </motion.div>

                {/* Feature 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700"
                >
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <i className="fas fa-fire text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-center text-gray-800 dark:text-white">
                    ⟳ Streak Tracker
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center">
                    Stay motivated with streak counters and performance trends
                    for all your habits.
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 sm:py-20 bg-indigo-50 dark:bg-gray-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg shadow-xl overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2 bg-gradient-to-br from-purple-600 to-indigo-600 p-8 sm:p-12 text-white">
                    <h3 className="text-xl sm:text-2xl font-bold mb-4">
                      Ready to transform your habits?
                    </h3>
                    <p className="mb-6 text-sm sm:text-base">
                      Join thousands of users who have successfully built better
                      routines with our habit tracking tools.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowSignInModal(true)}
                      className="px-6 py-2 bg-white text-indigo-600 font-medium rounded-md hover:bg-gray-100 transition-colors duration-300"
                    >
                      Get Started Today
                    </motion.button>
                  </div>
                  <div className="md:w-1/2 p-8 sm:p-12">
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
                      What Our Users Say
                    </h3>
                    <div className="mb-6">
                      <p className="italic text-gray-600 mb-3">
                        &ldquo;This app has completely changed how I approach my
                        daily routine. I&apos;ve never been so consistent with
                        my habits.&rdquo;
                      </p>
                      <p className="font-medium text-gray-800">- Sarah J.</p>
                    </div>
                    <div>
                      <p className="italic text-gray-600 mb-3">
                        &ldquo;The visual progress charts keep me motivated, and
                        I love seeing my streaks grow day by day.&rdquo;
                      </p>
                      <p className="font-medium text-gray-800">- Michael T.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      ) : (
        // Tracker page content
        <>
          {/* Header */}
          <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow py-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
              <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                Personal Analytics & Habit Tracker
              </h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowReminder(!showReminder)}
                  className="relative text-indigo-600 dark:text-indigo-400"
                >
                  <Bell className="w-6 h-6" />
                  {habits.some(
                    (h) =>
                      (h.name !== "Screen Time" && h.current < h.target) ||
                      (h.name === "Screen Time" && h.current > h.target)
                  ) && (
                    <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full"></span>
                  )}
                </button>
                <button
                  onClick={() => setActivePage("landing")}
                  className="px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 py-6">
            {/* Navigation */}
            <nav className="mb-6">
              <ul className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                <li className="flex-1">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`w-full py-2 px-4 rounded-md ${
                      activeTab === "dashboard"
                        ? "bg-white dark:bg-gray-800 shadow"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    Dashboard
                  </button>
                </li>
                <li className="flex-1">
                  <button
                    onClick={() => setActiveTab("add")}
                    className={`w-full py-2 px-4 rounded-md ${
                      activeTab === "add"
                        ? "bg-white dark:bg-gray-800 shadow"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    Add New Habit
                  </button>
                </li>
                <li className="flex-1">
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`w-full py-2 px-4 rounded-md ${
                      activeTab === "settings"
                        ? "bg-white dark:bg-gray-800 shadow"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    Settings
                  </button>
                </li>
              </ul>
            </nav>

            {/* Content based on active tab */}
            {activeTab === "dashboard" && renderDashboard()}
            {activeTab === "add" && renderHabitForm()}
            {activeTab === "settings" && renderSettings()}
            {activeTab === "details" && renderHabitDetails()}
          </main>
        </>
      )}

      {/* Reminder notification */}
      {showReminder && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-md">
          <div className="flex items-start">
            <Bell className="text-blue-500 mr-3 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Daily Habit Reminder</h3>
              <p className="text-sm">
                {habits.some(
                  (h) => h.name !== "Screen Time" && h.current < h.target
                )
                  ? `You still need to complete some of your daily habits!`
                  : `You're doing great today! Keep it up!`}
              </p>
              <div className="mt-3">
                <button
                  onClick={dismissReminder}
                  className="bg-blue-500 text-white text-sm py-1 px-3 rounded hover:bg-blue-600 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
