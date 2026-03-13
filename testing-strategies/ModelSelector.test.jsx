import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModelSelector from '../src/components/ModelSelector.jsx';

// Mock the LLM service
vi.mock('../src/services/llm.jsx', () => ({
  getLLMModels: vi.fn(),
  checkLLMConnection: vi.fn(),
}));

// Mock the settings service
vi.mock('../src/services/settings.js', () => ({
  getLLMConfig: vi.fn(() => ({
    apiUrl: 'https://lmstudionvidia.hexrebuilt.xyz/v1',
    apiKey: 'test-key',
    useLocalApi: false,
    model: '',
  })),
}));

describe('ModelSelector', () => {
  const mockOnModelSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnModelSelect.mockClear();
  });

  it('renders loading state initially', () => {
    render(
      <ModelSelector
        selectedModel=""
        onModelSelect={mockOnModelSelect}
      />
    );
    
    expect(screen.getByText('Loading models...')).toBeInTheDocument();
  });

  it('displays connected status when server is available', async () => {
    const { checkLLMConnection, getLLMModels } = await import('../src/services/llm.jsx');
    
    checkLLMConnection.mockResolvedValue({
      connected: true,
      models: [{ id: 'test-model-1' }],
      error: null,
    });
    
    getLLMModels.mockResolvedValue([
      { id: 'test-model-1' },
      { id: 'test-model-2' },
    ]);

    render(
      <ModelSelector
        selectedModel=""
        onModelSelect={mockOnModelSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
  });

  it('displays disconnected status when server is unavailable', async () => {
    const { checkLLMConnection } = await import('../src/services/llm.jsx');
    
    checkLLMConnection.mockResolvedValue({
      connected: false,
      models: [],
      error: 'Connection failed',
    });

    render(
      <ModelSelector
        selectedModel=""
        onModelSelect={mockOnModelSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });
  });

  it('displays available models in dropdown', async () => {
    const { checkLLMConnection, getLLMModels } = await import('../src/services/llm.jsx');
    
    checkLLMConnection.mockResolvedValue({
      connected: true,
      models: [{ id: 'test-model-1' }],
      error: null,
    });
    
    getLLMModels.mockResolvedValue([
      { id: 'test-model-1' },
      { id: 'test-model-2' },
    ]);

    render(
      <ModelSelector
        selectedModel=""
        onModelSelect={mockOnModelSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('test-model-1')).toBeInTheDocument();
      expect(screen.getByText('test-model-2')).toBeInTheDocument();
    });
  });

  it('calls onModelSelect when model is changed', async () => {
    const user = userEvent.setup();
    
    const { checkLLMConnection, getLLMModels } = await import('../src/services/llm.jsx');
    
    checkLLMConnection.mockResolvedValue({
      connected: true,
      models: [{ id: 'test-model-1' }],
      error: null,
    });
    
    getLLMModels.mockResolvedValue([
      { id: 'test-model-1' },
      { id: 'test-model-2' },
    ]);

    render(
      <ModelSelector
        selectedModel=""
        onModelSelect={mockOnModelSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('test-model-1')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'test-model-2');

    expect(mockOnModelSelect).toHaveBeenCalledWith('test-model-2');
  });

  it('displays error message when connection fails', async () => {
    const { checkLLMConnection } = await import('../src/services/llm.jsx');
    
    checkLLMConnection.mockResolvedValue({
      connected: false,
      models: [],
      error: 'Connection timeout',
    });

    render(
      <ModelSelector
        selectedModel=""
        onModelSelect={mockOnModelSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Connection timeout')).toBeInTheDocument();
    });
  });

  it('displays loaded model in status indicator', async () => {
    const { checkLLMConnection, getLLMModels } = await import('../src/services/llm.jsx');
    
    checkLLMConnection.mockResolvedValue({
      connected: true,
      models: [{ id: 'qwen3-4b' }],
      error: null,
    });
    
    getLLMModels.mockResolvedValue([
      { id: 'qwen3-4b' },
      { id: 'omnicoder-9b' },
    ]);

    render(
      <ModelSelector
        selectedModel=""
        onModelSelect={mockOnModelSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('(qwen3-4b)')).toBeInTheDocument();
    });
  });
});