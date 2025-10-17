/**
 * Componente principal da Calculadora de Mecânica dos Fluidos.
 * Este arquivo contém toda a lógica para a seleção de categorias,
 * entrada de dados, conversão de unidades, cálculo e exibição de resultados.
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { ArrowLeft, Droplets, Gauge, Weight, Waves, TrendingUp, Calculator as CalcIcon, Zap, RefreshCw, ChevronsRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Array de objetos que define as categorias de cálculo disponíveis na tela inicial.
// Cada objeto contém informações para renderizar um card de categoria.
const calculatorCategories = [
  {
    id: 'flow-rate',
    name: 'Vazão',
    icon: Droplets,
    color: 'from-cyan-500 to-blue-600',
    description: 'Calcular vazão volumétrica ou mássica'
  },
  {
    id: 'pressure',
    name: 'Pressão',
    icon: Gauge,
    color: 'from-blue-500 to-indigo-600',
    description: 'Calcular pressão em diversos cenários'
  },
  {
    id: 'density',
    name: 'Densidade',
    icon: Weight,
    color: 'from-indigo-500 to-purple-600',
    description: 'Calcular densidade do fluido'
  },
  {
    id: 'water-column',
    name: 'Coluna de Água',
    icon: Waves,
    color: 'from-cyan-400 to-teal-600',
    description: 'Converter pressão em altura de coluna de água'
  },
  {
    id: 'reynolds',
    name: 'Número de Reynolds',
    icon: TrendingUp,
    color: 'from-purple-500 to-pink-600',
    description: 'Determinar regime de escoamento'
  },
  {
    id: 'bernoulli',
    name: 'Equação de Bernoulli',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    description: 'Conservação de energia no escoamento'
  },
  {
    id: 'unit-conversion',
    name: 'Conversor de Unidades',
    icon: RefreshCw,
    color: 'from-green-500 to-teal-500',
    description: 'Converta unidades de medida comuns'
  }
];

// Objeto que armazena os fatores de conversão de diversas unidades para suas unidades base no Sistema Internacional (SI).
// Ex: 'km/h': 0.277778 significa que 1 km/h é igual a 0.277778 m/s.
const unitConversions = {
  velocity: {
    'm/s': 1,
    'km/h': 0.277778,
    'ft/s': 0.3048,
    'mph': 0.44704
  },
  area: {
    'm²': 1,
    'cm²': 0.0001,
    'ft²': 0.092903,
    'in²': 0.00064516
  },
  force: {
    'N': 1,
    'kN': 1000,
    'lbf': 4.44822
  },
  pressure: {
    'Pa': 1,
    'kPa': 1000,
    'bar': 100000,
    'psi': 6894.76,
    'atm': 101325
  },
  mass: {
    'kg': 1,
    'g': 0.001,
    'lb': 0.453592,
    'ton': 1000
  },
  volume: {
    'm³': 1,
    'L': 0.001,
    'cm³': 0.000001,
    'gal (US)': 0.00378541,
    'ft³': 0.0283168
  },
  density: {
    'kg/m³': 1,
    'g/cm³': 1000,
    'lb/ft³': 16.0185
  },
  length: {
    'm': 1,
    'cm': 0.01,
    'mm': 0.001,
    'ft': 0.3048,
    'in': 0.0254,
    'km': 1000,
    'mi': 1609.34,
  },
  viscosity: {
    'Pa·s': 1,
    'cP (centiPoise)': 0.001,
    'P (Poise)': 0.1
  },
  flow: {
    'm³/s': 1,
    'm³/h': 1/3600,
    'L/s': 0.001,
    'L/min': 0.001 / 60,
    'gal/min (US)': 0.00378541 / 60
  }
};

// Mapeamento das chaves de tipo de medida para rótulos em português, usados na interface do conversor de unidades.
const measurementTypeLabels = {
    velocity: 'Velocidade',
    area: 'Área',
    force: 'Força',
    pressure: 'Pressão',
    mass: 'Massa',
    volume: 'Volume',
    density: 'Densidade',
    length: 'Comprimento',
    viscosity: 'Viscosidade',
    flow: 'Vazão'
};

export default function Calculator() {
  // Estado para armazenar a categoria de cálculo atualmente selecionada pelo usuário.
  const [selectedCalculator, setSelectedCalculator] = useState(null);
  // Estado para armazenar os valores de entrada do usuário nos campos de input.
  const [inputs, setInputs] = useState({});
  // Estado para armazenar as unidades selecionadas pelo usuário para cada campo de input.
  const [units, setUnits] = useState({});
  // Estado para armazenar o objeto de resultado (valor e explicação) após o cálculo.
  const [result, setResult] = useState(null);
  // Estado para controlar a visibilidade da caixa de explicação da fórmula.
  const [showFormula, setShowFormula] = useState(false);

  // Efeito que executa quando o tipo de medida no conversor de unidades muda.
  // Ele reseta as unidades 'de' e 'para' para garantir que sejam válidas para o novo tipo.
  useEffect(() => {
    if (selectedCalculator?.id === 'unit-conversion') {
      const currentType = inputs.measurementType;
      const newAvailableUnits = unitConversions[currentType] ? Object.keys(unitConversions[currentType]) : [];

      if (!inputs.fromUnit || !newAvailableUnits.includes(inputs.fromUnit)) {
          setInputs(prev => ({...prev, fromUnit: newAvailableUnits[0]}));
      }
      if (!inputs.toUnit || !newAvailableUnits.includes(inputs.toUnit)) {
          setInputs(prev => ({...prev, toUnit: newAvailableUnits[1] || newAvailableUnits[0]}));
      }
    }
  }, [inputs.measurementType, selectedCalculator]);

  // Manipulador para quando o usuário seleciona uma categoria de cálculo.
  // Atualiza o estado e reseta os inputs, resultados e a visibilidade da fórmula.
  const handleCategorySelect = (category) => {
    setSelectedCalculator(category);
    setInputs({});
    setUnits({});
    setResult(null);
    setShowFormula(false);
    // Caso especial para o conversor de unidades, pré-seleciona um tipo de medida.
    if (category.id === 'unit-conversion') {
        setInputs({ measurementType: 'pressure', value: '' });
    }
  };

  // Manipulador para o botão "Voltar", reseta a visualização para a tela de seleção de categorias.
  const handleBack = () => {
    setSelectedCalculator(null);
    setInputs({});
    setUnits({});
    setResult(null);
    setShowFormula(false);
  };

  // Manipulador para mudanças nos campos de input, atualizando o estado 'inputs'.
  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value === '' ? '' : field === 'measurementType' || field === 'fromUnit' || field === 'toUnit' ? value : parseFloat(value) || value }));
  };

  // Manipulador para mudanças nos seletores de unidade, atualizando o estado 'units'.
  const handleUnitChange = (field, unit) => {
    setUnits(prev => ({ ...prev, [field]: unit }));
  };

  // Função auxiliar para converter um valor de sua unidade selecionada para a unidade base do SI.
  const convertToSI = (value, field, unitType) => {
    const unit = units[field];
    // Se a unidade não foi selecionada ou não existe, retorna o valor original.
    if (!unit || !unitConversions[unitType] || !unitConversions[unitType][unit]) {
      return value;
    }
    // Multiplica o valor pelo fator de conversão.
    return value * unitConversions[unitType][unit];
  };

  // Função principal que realiza o cálculo com base na categoria selecionada.
  const calculateResult = () => {
    if (!selectedCalculator) return;

    let calculatedResult = null;
    let explanation = '';

    // Um 'switch' para lidar com a lógica de cada tipo de cálculo.
    switch (selectedCalculator.id) {
      case 'flow-rate': {
        if (inputs.velocity && inputs.area) {
          const velocitySI = convertToSI(inputs.velocity, 'velocity', 'velocity');
          const areaSI = convertToSI(inputs.area, 'area', 'area');
          calculatedResult = velocitySI * areaSI;
          explanation = `Vazão (Q) = Velocidade (v) × Área da Seção Transversal (A)\n\nValores em SI:\nv = ${inputs.velocity} ${units.velocity || 'm/s'} = ${velocitySI.toFixed(4)} m/s\nA = ${inputs.area} ${units.area || 'm²'} = ${areaSI.toFixed(6)} m²\n\nQ = ${velocitySI.toFixed(4)} × ${areaSI.toFixed(6)} = ${calculatedResult.toFixed(6)} m³/s\nQ = ${(calculatedResult * 3600).toFixed(4)} m³/h\nQ = ${(calculatedResult * 1000).toFixed(4)} L/s`;
        }
        break;
      }
      
      case 'pressure': {
        if (inputs.force && inputs.area) {
          const forceSI = convertToSI(inputs.force, 'force', 'force');
          const areaSI = convertToSI(inputs.area, 'area', 'area');
          calculatedResult = forceSI / areaSI;
          explanation = `Pressão (P) = Força (F) / Área (A)\n\nValores em SI:\nF = ${inputs.force} ${units.force || 'N'} = ${forceSI.toFixed(2)} N\nA = ${inputs.area} ${units.area || 'm²'} = ${areaSI.toFixed(6)} m²\n\nP = ${forceSI.toFixed(2)} / ${areaSI.toFixed(6)} = ${calculatedResult.toFixed(2)} Pa\nP = ${(calculatedResult / 1000).toFixed(4)} kPa\nP = ${(calculatedResult / 100000).toFixed(6)} bar\nP = ${(calculatedResult / 6894.76).toFixed(4)} psi`;
        }
        break;
      }
      
      case 'density': {
        if (inputs.mass && inputs.volume) {
          const massSI = convertToSI(inputs.mass, 'mass', 'mass');
          const volumeSI = convertToSI(inputs.volume, 'volume', 'volume');
          calculatedResult = massSI / volumeSI;
          explanation = `Densidade (ρ) = Massa (m) / Volume (V)\n\nValores em SI:\nm = ${inputs.mass} ${units.mass || 'kg'} = ${massSI.toFixed(4)} kg\nV = ${inputs.volume} ${units.volume || 'm³'} = ${volumeSI.toFixed(6)} m³\n\nρ = ${massSI.toFixed(4)} / ${volumeSI.toFixed(6)} = ${calculatedResult.toFixed(2)} kg/m³\nρ = ${(calculatedResult / 1000).toFixed(4)} g/cm³`;
        }
        break;
      }
      
      case 'water-column': {
        if (inputs.pressure) {
          const pressureSI = convertToSI(inputs.pressure, 'pressure', 'pressure');
          const density = 1000; // água: kg/m³
          const gravity = 9.81; // m/s²
          calculatedResult = pressureSI / (density * gravity);
          explanation = `Altura (h) = Pressão (P) / (ρ × g)\n\nValores:\nP = ${inputs.pressure} ${units.pressure || 'Pa'} = ${pressureSI.toFixed(2)} Pa\nρ (água) = 1000 kg/m³\ng = 9,81 m/s²\n\nh = ${pressureSI.toFixed(2)} / (1000 × 9,81)\nh = ${calculatedResult.toFixed(4)} m\nh = ${(calculatedResult * 100).toFixed(2)} cm\nh = ${(calculatedResult * 1000).toFixed(1)} mm`;
        }
        break;
      }
      
      case 'reynolds': {
        if (inputs.velocity && inputs.diameter && inputs.density && inputs.viscosity) {
          const velocitySI = convertToSI(inputs.velocity, 'velocity', 'velocity');
          const diameterSI = convertToSI(inputs.diameter, 'diameter', 'length');
          const densitySI = convertToSI(inputs.density, 'density', 'density');
          const viscositySI = convertToSI(inputs.viscosity, 'viscosity', 'viscosity');
          
          calculatedResult = (densitySI * velocitySI * diameterSI) / viscositySI;
          
          let regime = '';
          if (calculatedResult < 2300) {
            regime = 'Laminar (Re < 2300)';
          } else if (calculatedResult < 4000) {
            regime = 'Transição (2300 < Re < 4000)';
          } else {
            regime = 'Turbulento (Re > 4000)';
          }
          
          explanation = `Número de Reynolds (Re) = (ρ × v × D) / μ\n\nValores em SI:\nρ = ${inputs.density} ${units.density || 'kg/m³'} = ${densitySI.toFixed(2)} kg/m³\nv = ${inputs.velocity} ${units.velocity || 'm/s'} = ${velocitySI.toFixed(4)} m/s\nD = ${inputs.diameter} ${units.diameter || 'm'} = ${diameterSI.toFixed(4)} m\nμ = ${inputs.viscosity} ${units.viscosity || 'Pa·s'} = ${viscositySI.toFixed(6)} Pa·s\n\nRe = (${densitySI.toFixed(2)} × ${velocitySI.toFixed(4)} × ${diameterSI.toFixed(4)}) / ${viscositySI.toFixed(6)}\nRe = ${calculatedResult.toFixed(0)}\n\nRegime de Escoamento: ${regime}`;
        }
        break;
      }
      
      case 'bernoulli': {
        if (inputs.pressure1 && inputs.velocity1 && inputs.height1 && inputs.velocity2 && inputs.height2 && inputs.density) {
          const g = 9.81;
          const pressure1SI = convertToSI(inputs.pressure1, 'pressure1', 'pressure');
          const velocity1SI = convertToSI(inputs.velocity1, 'velocity1', 'velocity');
          const height1SI = convertToSI(inputs.height1, 'height1', 'length');
          const velocity2SI = convertToSI(inputs.velocity2, 'velocity2', 'velocity');
          const height2SI = convertToSI(inputs.height2, 'height2', 'length');
          const densitySI = convertToSI(inputs.density, 'density', 'density');
          
          const term1 = pressure1SI + 0.5 * densitySI * Math.pow(velocity1SI, 2) + densitySI * g * height1SI;
          calculatedResult = term1 - 0.5 * densitySI * Math.pow(velocity2SI, 2) - densitySI * g * height2SI;
          
          explanation = `Equação de Bernoulli:\nP₁ + ½ρv₁² + ρgh₁ = P₂ + ½ρv₁² + ρgh₂\n\nValores no Ponto 1:\nP₁ = ${inputs.pressure1} ${units.pressure1 || 'Pa'} = ${pressure1SI.toFixed(2)} Pa\nv₁ = ${inputs.velocity1} ${units.velocity1 || 'm/s'} = ${velocity1SI.toFixed(4)} m/s\nh₁ = ${inputs.height1} ${units.height1 || 'm'} = ${height1SI.toFixed(4)} m\n\nValores no Ponto 2:\nv₂ = ${inputs.velocity2} ${units.velocity2 || 'm/s'} = ${velocity2SI.toFixed(4)} m/s\nh₂ = ${inputs.height2} ${units.height2 || 'm'} = ${height2SI.toFixed(4)} m\n\nDensidade: ρ = ${inputs.density} ${units.density || 'kg/m³'} = ${densitySI.toFixed(2)} kg/m³\n\nResolvendo para P₂:\nP₂ = ${calculatedResult.toFixed(2)} Pa\nP₂ = ${(calculatedResult / 1000).toFixed(4)} kPa\n\nEsta equação representa a conservação de energia ao longo de uma linha de corrente.`;
        }
        break;
      }
      case 'unit-conversion': {
        const { value, measurementType, fromUnit, toUnit } = inputs;
        if (value && measurementType && fromUnit && toUnit) {
          const fromFactor = unitConversions[measurementType][fromUnit]; // Fator para converter para SI
          const toFactor = unitConversions[measurementType][toUnit]; // Fator para converter para SI
          
          const valueInSI = value * fromFactor; // Valor convertido para a unidade base do SI
          const finalValue = valueInSI / toFactor; // Valor em SI convertido para a unidade final
          
          calculatedResult = finalValue;
          explanation = `Conversão de ${measurementTypeLabels[measurementType]}:\n\n${value} ${fromUnit}  =  ${finalValue.toPrecision(6)} ${toUnit}`;
        }
        break;
      }
    }

    // Atualiza o estado 'result' com o valor e a explicação.
    setResult({ value: calculatedResult, explanation });
  };
  
  // Função que retorna a explicação da fórmula para a categoria selecionada.
  const getFormulaExplanation = (calculatorId) => {
    const formulas = {
      'flow-rate': {
        title: 'Vazão (Q)',
        formula: 'Q = v × A',
        description: 'A vazão (Q) é o produto da velocidade do fluido (v) pela área da seção transversal (A) do duto.'
      },
      'pressure': {
        title: 'Pressão (P)',
        formula: 'P = F / A',
        description: 'A pressão (P) é a força (F) aplicada perpendicularmente a uma superfície, dividida pela área (A) dessa superfície.'
      },
      'density': {
        title: 'Densidade (ρ)',
        formula: 'ρ = m / V',
        description: 'A densidade (ρ) de uma substância é a sua massa (m) por unidade de volume (V).'
      },
      'water-column': {
        title: 'Pressão Hidrostática (P)',
        formula: 'P = ρ × g × h',
        description: 'A pressão exercida por uma coluna de fluido (P) é igual à densidade do fluido (ρ) multiplicada pela aceleração da gravidade (g) e pela altura da coluna (h). A calculadora resolve para h.'
      },
      'reynolds': {
        title: 'Número de Reynolds (Re)',
        formula: 'Re = (ρ × v × D) / μ',
        description: 'O Número de Reynolds é um número adimensional que ajuda a prever padrões de escoamento. Compara as forças de inércia com as forças de viscosidade. (ρ: densidade, v: velocidade, D: comprimento característico, μ: viscosidade dinâmica).'
      },
      'bernoulli': {
        title: 'Equação de Bernoulli',
        formula: 'P + ½ρv² + ρgh = constante',
        description: 'A equação de Bernoulli descreve a conservação de energia para um fluido em movimento. A soma da pressão (P), da energia cinética (½ρv²) e da energia potencial (ρgh) permanece constante ao longo de uma linha de corrente.'
      },
       'unit-conversion': {
        title: 'Conversão de Unidades',
        formula: 'Valor₂ = Valor₁ × (Fator₁ / Fator₂)',
        description: 'A conversão é feita transformando o valor inicial para a unidade base do SI (Sistema Internacional) e depois convertendo da unidade base para a unidade final desejada.'
      },
    };
    return formulas[calculatorId];
  };

  const formatResultValue = (value, calculatorId) => {
      if (value === null || isNaN(value)) return '';
      if (calculatorId === 'reynolds') {
          return value.toFixed(0);
      }
      if (Math.abs(value) > 10000 || (Math.abs(value) < 0.001 && Math.abs(value) > 0)) {
          return value.toPrecision(6);
      }
      return parseFloat(value.toFixed(6)).toString();
  };

  const getResultUnit = (calculatorId, currentInputs) => {
      switch(calculatorId) {
          case 'flow-rate': return 'm³/s';
          case 'pressure': return 'Pa';
          case 'density': return 'kg/m³';
          case 'water-column': return 'm';
          case 'reynolds': return '(adimensional)';
          case 'bernoulli': return 'Pa';
          case 'unit-conversion': return currentInputs.toUnit || '';
          default: return '';
      }
  };

  // Função que renderiza os campos de input dinamicamente com base na calculadora selecionada.
  const renderCalculatorInputs = () => {
    if (!selectedCalculator) return null;

    // Lógica especial para o conversor de unidades.
    if (selectedCalculator.id === 'unit-conversion') {
      const measurementTypes = Object.keys(measurementTypeLabels);
      const selectedMeasurement = inputs.measurementType || 'pressure';
      const availableUnits = unitConversions[selectedMeasurement] ? Object.keys(unitConversions[selectedMeasurement]) : [];

      return (
        <div className="space-y-6">
           <div>
            <Label className="text-cyan-100 text-base">Tipo de Medida</Label>
            <Select value={selectedMeasurement} onValueChange={(val) => {
              handleInputChange('measurementType', val);
            }}>
                <SelectTrigger className="w-full bg-slate-800/50 border-cyan-500/30 text-cyan-100 focus:border-cyan-400 h-12 text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-cyan-500/30">
                  {measurementTypes.map(type => (
                    <SelectItem key={type} value={type} className="text-cyan-100 focus:bg-cyan-500/20 focus:text-cyan-100">
                      {measurementTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
            </Select>
           </div>
           
           <div className="flex items-end gap-3">
              <div className="flex-1">
                  <Label htmlFor="value" className="text-cyan-100 text-base">Valor para converter</Label>
                  <Input
                    id="value"
                    type="number"
                    step="any"
                    value={inputs.value || ''}
                    onChange={(e) => handleInputChange('value', e.target.value)}
                    className="bg-slate-800/50 border-cyan-500/30 text-white focus:border-cyan-400 h-12 text-lg"
                    placeholder="Insira o valor"
                  />
              </div>
           </div>

           <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label className="text-cyan-100 text-base">De</Label>
                <Select value={inputs.fromUnit || availableUnits[0]} onValueChange={(val) => handleInputChange('fromUnit', val)}>
                    <SelectTrigger className="w-full bg-slate-800/50 border-cyan-500/30 text-cyan-100 focus:border-cyan-400 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-cyan-500/30">
                      {availableUnits.map(unit => (
                        <SelectItem key={unit} value={unit} className="text-cyan-100 focus:bg-cyan-500/20 focus:text-cyan-100">{unit}</SelectItem>
                      ))}
                    </SelectContent>
                </Select>
              </div>
              <div className="self-end pb-3 text-cyan-400">
                <ChevronsRight size={24}/>
              </div>
              <div className="flex-1">
                <Label className="text-cyan-100 text-base">Para</Label>
                <Select value={inputs.toUnit || availableUnits[1] || availableUnits[0]} onValueChange={(val) => handleInputChange('toUnit', val)}>
                    <SelectTrigger className="w-full bg-slate-800/50 border-cyan-500/30 text-cyan-100 focus:border-cyan-400 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-cyan-500/30">
                      {availableUnits.map(unit => (
                        <SelectItem key={unit} value={unit} className="text-cyan-100 focus:bg-cyan-500/20 focus:text-cyan-100">{unit}</SelectItem>
                      ))}
                    </SelectContent>
                </Select>
              </div>
           </div>
        </div>
      );
    }
    
    // Configuração dos campos de input para cada tipo de calculadora.
    const inputConfigs = {
      'flow-rate': [
        { 
          field: 'velocity', 
          label: 'Velocidade (v)', 
          unitType: 'velocity',
          units: ['m/s', 'km/h', 'ft/s', 'mph'],
          defaultUnit: 'm/s'
        },
        { 
          field: 'area', 
          label: 'Área da Seção Transversal (A)', 
          unitType: 'area',
          units: ['m²', 'cm²', 'ft²', 'in²'],
          defaultUnit: 'm²'
        }
      ],
      'pressure': [
        { 
          field: 'force', 
          label: 'Força (F)', 
          unitType: 'force',
          units: ['N', 'kN', 'lbf'],
          defaultUnit: 'N'
        },
        { 
          field: 'area', 
          label: 'Área (A)', 
          unitType: 'area',
          units: ['m²', 'cm²', 'ft²', 'in²'],
          defaultUnit: 'm²'
        }
      ],
      'density': [
        { 
          field: 'mass', 
          label: 'Massa (m)', 
          unitType: 'mass',
          units: ['kg', 'g', 'lb', 'ton'],
          defaultUnit: 'kg'
        },
        { 
          field: 'volume', 
          label: 'Volume (V)', 
          unitType: 'volume',
          units: ['m³', 'L', 'cm³', 'gal (US)', 'ft³'],
          defaultUnit: 'm³'
        }
      ],
      'water-column': [
        { 
          field: 'pressure', 
          label: 'Pressão (P)', 
          unitType: 'pressure',
          units: ['Pa', 'kPa', 'bar', 'psi', 'atm'],
          defaultUnit: 'Pa'
        }
      ],
      'reynolds': [
        { 
          field: 'density', 
          label: 'Densidade do Fluido (ρ)', 
          unitType: 'density',
          units: ['kg/m³', 'g/cm³', 'lb/ft³'],
          defaultUnit: 'kg/m³'
        },
        { 
          field: 'velocity', 
          label: 'Velocidade do Escoamento (v)', 
          unitType: 'velocity',
          units: ['m/s', 'km/h', 'ft/s', 'mph'],
          defaultUnit: 'm/s'
        },
        { 
          field: 'diameter', 
          label: 'Comprimento Característico (D)', 
          unitType: 'length',
          units: ['m', 'cm', 'mm', 'ft', 'in'],
          defaultUnit: 'm'
        },
        { 
          field: 'viscosity', 
          label: 'Viscosidade Dinâmica (μ)', 
          unitType: 'viscosity',
          units: ['Pa·s', 'cP (centiPoise)', 'P (Poise)'],
          defaultUnit: 'Pa·s'
        }
      ],
      'bernoulli': [
        { 
          field: 'pressure1', 
          label: 'Pressão no Ponto 1 (P₁)', 
          unitType: 'pressure',
          units: ['Pa', 'kPa', 'bar', 'psi', 'atm'],
          defaultUnit: 'Pa'
        },
        { 
          field: 'velocity1', 
          label: 'Velocidade no Ponto 1 (v₁)', 
          unitType: 'velocity',
          units: ['m/s', 'km/h', 'ft/s', 'mph'],
          defaultUnit: 'm/s'
        },
        { 
          field: 'height1', 
          label: 'Altura no Ponto 1 (h₁)', 
          unitType: 'length',
          units: ['m', 'cm', 'mm', 'ft', 'in'],
          defaultUnit: 'm'
        },
        { 
          field: 'velocity2', 
          label: 'Velocidade no Ponto 2 (v₂)', 
          unitType: 'velocity',
          units: ['m/s', 'km/h', 'ft/s', 'mph'],
          defaultUnit: 'm/s'
        },
        { 
          field: 'height2', 
          label: 'Altura no Ponto 2 (h₂)', 
          unitType: 'length',
          units: ['m', 'cm', 'mm', 'ft', 'in'],
          defaultUnit: 'm'
        },
        { 
          field: 'density', 
          label: 'Densidade do Fluido (ρ)', 
          unitType: 'density',
          units: ['kg/m³', 'g/cm³', 'lb/ft³'],
          defaultUnit: 'kg/m³'
        }
      ]
    };

    const config = inputConfigs[selectedCalculator.id] || [];

    // Renderiza os campos de input com base na configuração.
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {config.map((input) => (
          <div key={input.field} className="space-y-2">
            <Label htmlFor={input.field} className="text-cyan-100 text-base">
              {input.label}
            </Label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  id={input.field}
                  type="number"
                  step="any"
                  value={inputs[input.field] || ''}
                  onChange={(e) => handleInputChange(input.field, e.target.value)}
                  className="bg-slate-800/50 border-cyan-500/30 text-white focus:border-cyan-400 h-12 text-lg"
                  placeholder="Insira o valor"
                />
              </div>
              <Select
                value={units[input.field] || input.defaultUnit}
                onValueChange={(value) => handleUnitChange(input.field, value)}
              >
                <SelectTrigger className="w-40 bg-slate-800/50 border-cyan-500/30 text-cyan-100 focus:border-cyan-400 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-cyan-500/30">
                  {input.units.map((unit) => (
                    <SelectItem 
                      key={unit} 
                      value={unit}
                      className="text-cyan-100 focus:bg-cyan-500/20 focus:text-cyan-100"
                    >
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Estrutura JSX principal do componente.
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      {/* Elementos decorativos de fundo com animação. */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Cabeçalho da página. */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Calculadora de Sistemas Fluidomecânicos
            </h1>
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full" />
          </div>
          <p className="text-cyan-100/70 mt-4 text-lg">
            Cálculos precisos para dinâmica de fluidos e hidráulica
          </p>
        </motion.div>

        {/* Animação de transição entre a tela de categorias e a tela de cálculo. */}
        <AnimatePresence mode="wait">
          {!selectedCalculator ? (
            // Se nenhuma calculadora foi selecionada, mostra a grade de categorias.
            <motion.div
              key="categories"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {calculatorCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className="group bg-slate-900/50 border-cyan-500/20 hover:border-cyan-400/50 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20 backdrop-blur-sm overflow-hidden relative"
                      onClick={() => handleCategorySelect(category)}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                      
                      <CardHeader>
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-8 h-8 text-cyan-400" />
                        </div>
                        <CardTitle className="text-white text-xl group-hover:text-cyan-300 transition-colors">
                          {category.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-cyan-100/60 group-hover:text-cyan-100/80 transition-colors">
                          {category.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            // Se uma calculadora foi selecionada, mostra a interface de cálculo.
            <motion.div
              key="calculator"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <Button
                onClick={handleBack}
                variant="ghost"
                className="mb-6 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Categorias
              </Button>

              <Card className="bg-slate-900/70 border-cyan-500/30 backdrop-blur-sm shadow-2xl shadow-cyan-500/10">
                <CardHeader className="border-b border-cyan-500/20 pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedCalculator.color} flex-shrink-0 flex items-center justify-center`}>
                        {React.createElement(selectedCalculator.icon, { className: "w-7 h-7 text-white" })}
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-white">
                          {selectedCalculator.name}
                        </CardTitle>
                        <p className="text-cyan-100/60 text-sm mt-1">
                          {selectedCalculator.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-8">
                  
                  {/* Renderiza os campos de input dinamicamente. */}
                  {renderCalculatorInputs()}

                  {/* Botão para executar o cálculo. */}
                  <Button
                    onClick={calculateResult}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-6 text-lg shadow-lg shadow-cyan-500/25"
                  >
                    <CalcIcon className="w-5 h-5 mr-2" />
                    Calcular
                  </Button>

                  {/* Se houver um resultado, exibe a caixa de resultado com animação. */}
                  {result && result.value !== null && !isNaN(result.value) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="mt-6 p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 text-center"
                    >
                      <h3 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center justify-center gap-2">
                        <Zap className="w-5 h-5" />
                        Resultado
                      </h3>
                      
                      <div className="flex items-baseline justify-center gap-3">
                        <div className="text-4xl md:text-5xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400">
                            {formatResultValue(result.value, selectedCalculator.id)}
                        </div>
                        <span className="text-xl text-cyan-400">{getResultUnit(selectedCalculator.id, inputs)}</span>
                      </div>

                      <div className="mt-4 bg-slate-900/50 p-4 rounded-lg font-mono text-cyan-100 whitespace-pre-line text-sm md:text-base text-left">
                        {result.explanation}
                      </div>
                    </motion.div>
                  )}

                  <div className="pt-4 border-t border-cyan-500/20 flex flex-col items-center">
                    <Button variant="outline" size="sm" onClick={() => setShowFormula(!showFormula)} className="bg-transparent border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200">
                        <Info className="w-4 h-4 mr-2"/>
                        {showFormula ? "Ocultar Fórmula" : "Ver Fórmula"}
                    </Button>
                    {/* Animação para mostrar/ocultar a explicação da fórmula. */}
                    <AnimatePresence>
                    {showFormula && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="w-full mt-4 p-4 rounded-xl bg-slate-800/50 border border-cyan-400/20"
                      >
                        <h3 className="text-lg font-semibold text-cyan-300 mb-2">
                          {getFormulaExplanation(selectedCalculator.id).title}
                        </h3>
                        <div className="bg-slate-900/50 p-3 rounded-lg font-mono text-center text-cyan-100 text-lg mb-3">
                          {getFormulaExplanation(selectedCalculator.id).formula}
                        </div>
                        <p className="text-cyan-100/70 text-sm">
                          {getFormulaExplanation(selectedCalculator.id).description}
                        </p>
                      </motion.div>
                    )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
