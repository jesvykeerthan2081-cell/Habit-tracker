import './App.css';
import React from 'react';

// router
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// framer
import { AnimatePresence } from 'framer-motion';

// stores
import { useDialogStore } from './stores/dialogStore';

// main components
import FirebaseMainPage from './components/FirebaseMainPage';
import Modal from './components/Modal';
import Dialog from './components/Containment/Dialog';
import HeroPage from './components/HeroPage/HeroPage';

// context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// hooks
import useColorScheme from './hooks/useColorScheme';
import useAchievementsCheck from './hooks/useAchievementsCheck';
import { useFirebaseStores } from './hooks/useFirebaseStores';

// db
import dbModalRoutes from './db/dbModalRoutes';

const PUBLIC_URL = process.env.PUBLIC_URL;

/* ------------------------------------------------
   Inline Loading Screen Component
------------------------------------------------ */
function LoadingScreen() {
	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100vh',
				background: '#030303',
				color: 'white',
				fontSize: '1.2rem',
			}}
		>
			<div>Loading...</div>
		</div>
	);
}

/* ------------------------------------------------
   Error Boundary Component
------------------------------------------------ */
class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error, info) {
		console.error('App crashed with error:', error, info);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						height: '100vh',
						background: '#111',
						color: '#fff',
						textAlign: 'center',
					}}
				>
					<h2>Something went wrong 😢</h2>
					<p>Please refresh or try again later.</p>
				</div>
			);
		}
		return this.props.children;
	}
}

/* ------------------------------------------------
   Private Route for Auth Protection
------------------------------------------------ */
function PrivateRoute({ children }) {
	const { user, loading } = useAuth();

	if (loading) return <LoadingScreen />;
	if (!user) return <Navigate to={`${PUBLIC_URL}/hero`} replace />;

	return children;
}

/* ------------------------------------------------
   Main App Content
------------------------------------------------ */
function AppContent() {
	const location = useLocation();
	const isDialogVisible = useDialogStore((s) => s.isVisible);

	// Initialize Firebase stores
	useFirebaseStores();

	// Sync color scheme & achievements
	useColorScheme();
	useAchievementsCheck();

	return (
		<main className="App">
			<AnimatePresence initial={false}>
				<Routes location={location} key={location.pathname}>
					{/* Redirect unknown routes */}
					<Route path="*" element={<Navigate to={PUBLIC_URL} />} />

					{/* Public Hero Page */}
					<Route path={`${PUBLIC_URL}/hero`} element={<HeroPage />} />

					{/* Protected Main Page */}
					<Route
						path={PUBLIC_URL}
						element={
							<PrivateRoute>
								<FirebaseMainPage />
							</PrivateRoute>
						}
					/>

					{/* Modal Routes */}
					<Route path={`${PUBLIC_URL}/modal`} element={<Modal />}>
						{dbModalRoutes.map((r) => (
							<Route key={r.path} path={r.path} element={r.element} />
						))}
					</Route>
				</Routes>

				{/* Conditional Dialog */}
				{isDialogVisible && <Dialog key="dialog" />}
			</AnimatePresence>
		</main>
	);
}

/* ------------------------------------------------
   Root App Wrapper
------------------------------------------------ */
function App() {
	return (
		<AuthProvider>
			<ErrorBoundary>
				<AppContent />
			</ErrorBoundary>
		</AuthProvider>
	);
}

export default App;
