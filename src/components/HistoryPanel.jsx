import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Trash2, X, History } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const HISTORY_KEY = 'calculationHistory';
const MAX_HISTORY = 25;

export default function HistoryPanel({ isOpen, onClose }) {
  const [history, setHistory] = useState([]);
  const [expanded, setExpanded] = useState({});

  // Carrega histórico do localStorage ao montar e configura listener para atualizações
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
    
    // Adiciona listener para evento customizado de atualização
    const handleHistoryUpdate = () => {
      try {
        const saved = localStorage.getItem(HISTORY_KEY);
        if (saved) setHistory(JSON.parse(saved));
      } catch {}
    };
    
    window.addEventListener('historyUpdated', handleHistoryUpdate);
    
    // Cleanup
    return () => {
      window.removeEventListener('historyUpdated', handleHistoryUpdate);
    };
  }, []);

  // Salva histórico no localStorage sempre que mudar
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {}
  }, [history]);

  // Adiciona novo cálculo ao histórico
  const addCalculation = (calc) => {
    const newEntry = {
      id: Date.now(),
      calculator: calc.calculator,
      result: calc.result,
      formula: calc.formula,
      values: calc.values,
      timestamp: new Date().toLocaleString('pt-BR')
    };
    setHistory(prev => [newEntry, ...prev].slice(0, MAX_HISTORY));
  };

  // Remove item individual
  const removeItem = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  // Limpa histórico completo
  const clearHistory = () => {
    setHistory([]);
  };

  // Alterna expansão de item
  const toggleExpanded = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Disponibiliza função addCalculation globalmente via window
  useEffect(() => {
    window.addCalculation = addCalculation;
    return () => {
      delete window.addCalculation;
    };
  }, []);

  return (
    <>


      {/* Painel com transições suaves */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border shadow-xl z-40 flex flex-col"
          >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-card-foreground">Histórico de Cálculos</h2>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
              title="Limpar histórico"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-card-foreground transition-colors p-1 rounded"
            title="Fechar histórico"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Lista de cálculos */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhum cálculo realizado ainda.</p>
        ) : (
          history.map(item => {
            const displayName = item.calculatorName || item.calculator || 'Cálculo';
            const displayTime = item.timestamp ? (() => {
              try { return new Date(item.timestamp).toLocaleString('pt-BR'); } catch { return item.timestamp; }
            })() : '';
            const displayResult = item.resultUnit ? `${item.result} ${item.resultUnit}` : `${item.result}`;
            return (
            <div key={item.id} className="bg-background rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-card-foreground">{displayName}</h3>
                  {displayTime && <p className="text-xs text-muted-foreground">{displayTime}</p>}
                  <p className="text-sm font-mono text-primary mt-1">{displayResult}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="text-muted-foreground hover:text-card-foreground transition-colors p-1 rounded"
                    title={expanded[item.id] ? "Recolher" : "Expandir"}
                  >
                    {expanded[item.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                    title="Remover item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <AnimatePresence initial={false}>
                {expanded[item.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-2 pt-2 border-t border-border space-y-2 overflow-hidden"
                  >
                    {item.formula && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Fórmula:</p>
                        <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap">{item.formula}</pre>
                      </div>
                    )}
                    {item.explanation && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Explicação:</p>
                        <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap">{item.explanation}</pre>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
          })
        )}
      </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}