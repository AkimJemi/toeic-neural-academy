import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock child components to isolate App testing
vi.mock('../components/NeuralBackground', () => ({
    NeuralBackground: () => <div data-testid="neural-bg">Background</div>
}));
vi.mock('../components/NeuralParticles', () => ({
    NeuralParticles: () => <div data-testid="neural-particles">Particles</div>
}));
vi.mock('../components/Layout', () => ({
    Layout: () => <div data-testid="layout">Layout Content</div>
}));
// Mock i18n
vi.mock('../i18n', () => ({}));


describe('App Component', () => {
    it('renders without crashing', () => {
        render(<App />);
        expect(screen.getByTestId('neural-bg')).toBeInTheDocument();
        // Since Layout is inside Routes, it might not render immediately if path issues, but / is default
        // However, BrowserRouter is inside App, so Routes should match /
        // Wait, Layout is an Outlet wrapper usually.
        // If Layout is mocked to just return div, it might not render Outcome?
        // Actually Layout SHOULD render <Outlet />.
        // But for this test, if App renders BrowserRouter -> Routes -> Route(Layout) -> / path.
        // It shoud render Layout.
    });
});
