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
    color: 'from-purple-500 to-violet-600',
    description: 'Calcular vazão volumétrica ou mássica'
  },
  {
    id: 'velocity-flow',
    name: 'Velocidade/Vazão',
    icon: TrendingUp,
    color: 'from-blue-500 to-violet-600',
    description: 'Calcular velocidade a partir da vazão'
  },
  {
    id: 'pressure',
    name: 'Pressão',
    icon: Gauge,
    color: 'from-violet-500 to-purple-600',
    description: 'Calcular pressão em diversos cenários'
  },
  {
    id: 'density',
    name: 'Densidade',
    icon: Weight,
    color: 'from-purple-500 to-fuchsia-600',
    description: 'Calcular densidade do fluido'
  },
  {
    id: 'water-column',
    name: 'Coluna de Água',
    icon: Waves,
    color: 'from-violet-400 to-purple-600',
    description: 'Converter pressão em altura de coluna de água'
  },
  {
    id: 'reynolds',
    name: 'Número de Reynolds',
    icon: TrendingUp,
    color: 'from-fuchsia-500 to-purple-600',
    description: 'Determinar regime de escoamento'
  },
  {
    id: 'relative-roughness',
    name: 'Rugosidade Relativa',
    icon: Waves,
    color: 'from-green-500 to-blue-600',
    description: 'Calcular rugosidade relativa da tubulação'
  },
  {
    id: 'friction-factor',
    name: 'Fator de Atrito',
    icon: Zap,
    color: 'from-orange-500 to-red-600',
    description: 'Calcular fator de atrito (Swamee-Jain)'
  },
  {
    id: 'head-loss',
    name: 'Perda de Carga',
    icon: TrendingUp,
    color: 'from-red-500 to-orange-600',
    description: 'Calcular perda de carga total'
  },
  {
    id: 'energy-equation',
    name: 'Equação da Energia',
    icon: Zap,
    color: 'from-blue-500 to-green-600',
    description: 'Calcular carga manométrica da bomba'
  },
  {
    id: 'pump-power',
    name: 'Potência da Bomba',
    icon: Zap,
    color: 'from-yellow-500 to-orange-600',
    description: 'Calcular potência da bomba'
  },
  {
    id: 'npsh',
    name: 'NPSH Disponível',
    icon: Gauge,
    color: 'from-cyan-500 to-blue-600',
    description: 'Calcular NPSH disponível'
  },
  {
    id: 'bernoulli',
    name: 'Equação de Bernoulli',
    icon: Zap,
    color: 'from-purple-500 to-violet-500',
    description: 'Conservação de energia no escoamento'
  },
  {
    id: 'unit-conversion',
    name: 'Conversor de Unidades',
    icon: RefreshCw,
    color: 'from-violet-500 to-fuchsia-500',
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
      
      case 'velocity-flow': {
        if (inputs.flow && inputs.area) {
          const flowSI = convertToSI(inputs.flow, 'flow', 'flow');
          const areaSI = convertToSI(inputs.area, 'area', 'area');
          calculatedResult = flowSI / areaSI;
          explanation = `Velocidade (v) = Vazão (Q) / Área da Seção Transversal (A)\n\nValores em SI:\nQ = ${inputs.flow} ${units.flow || 'm³/s'} = ${flowSI.toFixed(6)} m³/s\nA = ${inputs.area} ${units.area || 'm²'} = ${areaSI.toFixed(6)} m²\n\nv = ${flowSI.toFixed(6)} / ${areaSI.toFixed(6)} = ${calculatedResult.toFixed(4)} m/s\nv = ${(calculatedResult * 3.6).toFixed(4)} km/h`;
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
      
      case 'relative-roughness': {
        if (inputs.roughness && inputs.diameter) {
          const roughnessSI = convertToSI(inputs.roughness, 'roughness', 'length');
          const diameterSI = convertToSI(inputs.diameter, 'diameter', 'length');
          
          calculatedResult = roughnessSI / diameterSI;
          
          explanation = `Rugosidade Relativa (ε/D) = Rugosidade Absoluta (ε) / Diâmetro (D)\n\nValores em SI:\nε = ${inputs.roughness} ${units.roughness || 'mm'} = ${roughnessSI.toFixed(6)} m\nD = ${inputs.diameter} ${units.diameter || 'm'} = ${diameterSI.toFixed(4)} m\n\nε/D = ${roughnessSI.toFixed(6)} / ${diameterSI.toFixed(4)} = ${calculatedResult.toFixed(6)}\n\nEste valor é adimensional e representa a rugosidade relativa da tubulação.`;
        }
        break;
      }
      
      case 'friction-factor': {
        if (inputs.reynolds && inputs.relativeRoughness) {
          const reynoldsSI = inputs.reynolds; // Adimensional
          const relativeRoughnessSI = inputs.relativeRoughness; // Adimensional
          
          // Equação de Swamee-Jain para fator de atrito
          calculatedResult = 0.25 / Math.pow(Math.log10(relativeRoughnessSI/3.7 + 5.74/Math.pow(reynoldsSI, 0.9)), 2);
          
          explanation = `Fator de Atrito (f) - Equação de Swamee-Jain:\nf = 0.25 / [log₁₀(ε/D/3.7 + 5.74/Re^0.9)]²\n\nValores:\nNúmero de Reynolds (Re) = ${reynoldsSI.toFixed(0)}\nRugosidade Relativa (ε/D) = ${relativeRoughnessSI.toFixed(6)}\n\nf = 0.25 / [log₁₀(${relativeRoughnessSI.toFixed(6)}/3.7 + 5.74/${reynoldsSI.toFixed(0)}^0.9)]²\nf = ${calculatedResult.toFixed(6)}\n\nEste valor é adimensional e representa o fator de atrito de Darcy-Weisbach.`;
        }
        break;
      }
      
      case 'head-loss': {
        if (inputs.frictionFactor && inputs.length && inputs.diameter && inputs.velocity && inputs.kSum) {
          const frictionFactorSI = inputs.frictionFactor; // Adimensional
          const lengthSI = convertToSI(inputs.length, 'length', 'length');
          const diameterSI = convertToSI(inputs.diameter, 'diameter', 'length');
          const velocitySI = convertToSI(inputs.velocity, 'velocity', 'velocity');
          const kSumSI = inputs.kSum; // Adimensional - soma dos coeficientes de perda localizada
          const g = 9.81; // m/s²
          
          // Perda de carga distribuída (Darcy-Weisbach)
          const distributedLoss = frictionFactorSI * (lengthSI / diameterSI) * (Math.pow(velocitySI, 2) / (2 * g));
          
          // Perda de carga localizada
          const localizedLoss = kSumSI * (Math.pow(velocitySI, 2) / (2 * g));
          
          // Perda de carga total
          calculatedResult = distributedLoss + localizedLoss;
          
          explanation = `Perda de Carga Total (hₜ) = Perda Distribuída (hₗ) + Perda Localizada (hₘ)\n\nPerda Distribuída (Darcy-Weisbach):\nhₗ = f × (L/D) × (v²/2g)\n\nPerda Localizada:\nhₘ = Σk × (v²/2g)\n\nValores em SI:\nFator de Atrito (f) = ${frictionFactorSI.toFixed(6)}\nComprimento (L) = ${inputs.length} ${units.length || 'm'} = ${lengthSI.toFixed(2)} m\nDiâmetro (D) = ${inputs.diameter} ${units.diameter || 'm'} = ${diameterSI.toFixed(4)} m\nVelocidade (v) = ${inputs.velocity} ${units.velocity || 'm/s'} = ${velocitySI.toFixed(4)} m/s\nSoma dos Coeficientes (Σk) = ${kSumSI.toFixed(2)}\ng = 9,81 m/s²\n\nPerda Distribuída = ${distributedLoss.toFixed(4)} m\nPerda Localizada = ${localizedLoss.toFixed(4)} m\nPerda Total = ${calculatedResult.toFixed(4)} m`;
        }
        break;
      }
      
      case 'energy-equation': {
        if (inputs.z1 && inputs.z2 && inputs.p1 && inputs.p2 && inputs.v1 && inputs.v2 && inputs.headLoss && inputs.density) {
          const z1SI = convertToSI(inputs.z1, 'z1', 'length');
          const z2SI = convertToSI(inputs.z2, 'z2', 'length');
          const p1SI = convertToSI(inputs.p1, 'p1', 'pressure');
          const p2SI = convertToSI(inputs.p2, 'p2', 'pressure');
          const v1SI = convertToSI(inputs.v1, 'v1', 'velocity');
          const v2SI = convertToSI(inputs.v2, 'v2', 'velocity');
          const headLossSI = convertToSI(inputs.headLoss, 'headLoss', 'length');
          const densitySI = convertToSI(inputs.density, 'density', 'density');
          const g = 9.81; // m/s²
          
          // Carga manométrica da bomba (HB) usando a equação da energia
          calculatedResult = (p2SI - p1SI) / (densitySI * g) + (Math.pow(v2SI, 2) - Math.pow(v1SI, 2)) / (2 * g) + (z2SI - z1SI) + headLossSI;
          
          explanation = `Equação da Energia para Carga Manométrica da Bomba (Hₘ):\nHₘ = (P₂-P₁)/(ρg) + (v₂²-v₁²)/(2g) + (z₂-z₁) + hₜ\n\nValores em SI:\nCota 1 (z₁) = ${inputs.z1} ${units.z1 || 'm'} = ${z1SI.toFixed(2)} m\nCota 2 (z₂) = ${inputs.z2} ${units.z2 || 'm'} = ${z2SI.toFixed(2)} m\nPressão 1 (P₁) = ${inputs.p1} ${units.p1 || 'Pa'} = ${p1SI.toFixed(2)} Pa\nPressão 2 (P₂) = ${inputs.p2} ${units.p2 || 'Pa'} = ${p2SI.toFixed(2)} Pa\nVelocidade 1 (v₁) = ${inputs.v1} ${units.v1 || 'm/s'} = ${v1SI.toFixed(4)} m/s\nVelocidade 2 (v₂) = ${inputs.v2} ${units.v2 || 'm/s'} = ${v2SI.toFixed(4)} m/s\nPerda de Carga (hₜ) = ${inputs.headLoss} ${units.headLoss || 'm'} = ${headLossSI.toFixed(4)} m\nDensidade (ρ) = ${inputs.density} ${units.density || 'kg/m³'} = ${densitySI.toFixed(2)} kg/m³\ng = 9,81 m/s²\n\nHₘ = ${((p2SI - p1SI) / (densitySI * g)).toFixed(4)} + ${((Math.pow(v2SI, 2) - Math.pow(v1SI, 2)) / (2 * g)).toFixed(4)} + ${(z2SI - z1SI).toFixed(4)} + ${headLossSI.toFixed(4)}\nHₘ = ${calculatedResult.toFixed(4)} m`;
        }
        break;
      }
      
      case 'pump-power': {
        if (inputs.flow && inputs.head && inputs.density && inputs.efficiency) {
          const flowSI = convertToSI(inputs.flow, 'flow', 'flow');
          const headSI = convertToSI(inputs.head, 'head', 'length');
          const densitySI = convertToSI(inputs.density, 'density', 'density');
          const efficiencySI = inputs.efficiency / 100; // Convertendo de porcentagem para decimal
          const g = 9.81; // m/s²
          
          // Potência da bomba
          calculatedResult = (densitySI * g * flowSI * headSI) / efficiencySI;
          
          explanation = `Potência da Bomba (P) = (ρ × g × Q × H) / η\n\nValores em SI:\nDensidade (ρ) = ${inputs.density} ${units.density || 'kg/m³'} = ${densitySI.toFixed(2)} kg/m³\ng = 9,81 m/s²\nVazão (Q) = ${inputs.flow} ${units.flow || 'm³/s'} = ${flowSI.toFixed(6)} m³/s\nAltura Manométrica (H) = ${inputs.head} ${units.head || 'm'} = ${headSI.toFixed(2)} m\nEficiência (η) = ${inputs.efficiency}% = ${efficiencySI.toFixed(2)}\n\nP = (${densitySI.toFixed(2)} × 9,81 × ${flowSI.toFixed(6)} × ${headSI.toFixed(2)}) / ${efficiencySI.toFixed(2)}\nP = ${calculatedResult.toFixed(2)} W\nP = ${(calculatedResult / 1000).toFixed(4)} kW\nP = ${(calculatedResult / 745.7).toFixed(4)} hp`;
        }
        break;
      }
      
      case 'npsh': {
        if (inputs.atmosphericPressure && inputs.vaporPressure && inputs.suctionHeight && inputs.headLoss && inputs.density) {
          const atmosphericPressureSI = convertToSI(inputs.atmosphericPressure, 'atmosphericPressure', 'pressure');
          const vaporPressureSI = convertToSI(inputs.vaporPressure, 'vaporPressure', 'pressure');
          const suctionHeightSI = convertToSI(inputs.suctionHeight, 'suctionHeight', 'length');
          const headLossSI = convertToSI(inputs.headLoss, 'headLoss', 'length');
          const densitySI = convertToSI(inputs.density, 'density', 'density');
          const g = 9.81; // m/s²
          
          // NPSH Disponível
          calculatedResult = (atmosphericPressureSI - vaporPressureSI) / (densitySI * g) - suctionHeightSI - headLossSI;
          
          explanation = `NPSH Disponível = (Pₐₜₘ - Pᵥ) / (ρg) - hₛ - hₗ\n\nValores em SI:\nPressão Atmosférica (Pₐₜₘ) = ${inputs.atmosphericPressure} ${units.atmosphericPressure || 'Pa'} = ${atmosphericPressureSI.toFixed(2)} Pa\nPressão de Vapor (Pᵥ) = ${inputs.vaporPressure} ${units.vaporPressure || 'Pa'} = ${vaporPressureSI.toFixed(2)} Pa\nAltura de Sucção (hₛ) = ${inputs.suctionHeight} ${units.suctionHeight || 'm'} = ${suctionHeightSI.toFixed(2)} m\nPerda de Carga na Sucção (hₗ) = ${inputs.headLoss} ${units.headLoss || 'm'} = ${headLossSI.toFixed(4)} m\nDensidade (ρ) = ${inputs.density} ${units.density || 'kg/m³'} = ${densitySI.toFixed(2)} kg/m³\ng = 9,81 m/s²\n\nNPSH = ${((atmosphericPressureSI - vaporPressureSI) / (densitySI * g)).toFixed(4)} - ${suctionHeightSI.toFixed(2)} - ${headLossSI.toFixed(4)}\nNPSH = ${calculatedResult.toFixed(4)} m`;
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
      'velocity-flow': {
        title: 'Velocidade (v)',
        formula: 'v = Q / A',
        description: 'A velocidade do fluido (v) é a vazão (Q) dividida pela área da seção transversal (A) do duto.'
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
      'relative-roughness': {
        title: 'Rugosidade Relativa (ε/D)',
        formula: 'ε/D',
        description: 'A rugosidade relativa é a razão entre a rugosidade absoluta da superfície interna do tubo (ε) e o diâmetro do tubo (D).'
      },
      'friction-factor': {
        title: 'Fator de Atrito (f) - Equação de Swamee-Jain',
        formula: 'f = 0.25 / [log₁₀(ε/3.7D + 5.74/Re^0.9)]²',
        description: 'A equação de Swamee-Jain é uma aproximação para o fator de atrito de Darcy-Weisbach para escoamento turbulento em tubos. Depende da rugosidade relativa (ε/D) e do número de Reynolds (Re).'
      },
      'head-loss': {
        title: 'Perda de Carga Total (hₜ)',
        formula: 'hₜ = f × (L/D) × (v²/2g) + Σk × (v²/2g)',
        description: 'A perda de carga total é a soma da perda de carga distribuída (primeiro termo) e da perda de carga localizada (segundo termo). Onde f é o fator de atrito, L é o comprimento do tubo, D é o diâmetro, v é a velocidade do fluido, g é a aceleração da gravidade e Σk é a soma dos coeficientes de perda localizada.'
      },
      'energy-equation': {
        title: 'Equação da Energia para Carga Manométrica (Hₘ)',
        formula: 'Hₘ = (z₂-z₁) + (P₂-P₁)/(ρg) + (v₂²-v₁²)/(2g) + hₜ',
        description: 'A carga manométrica da bomba é calculada pela equação da energia, considerando a diferença de cotas (z₂-z₁), a diferença de pressões (P₂-P₁), a diferença de energias cinéticas (v₂²-v₁²) e a perda de carga total (hₜ).'
      },
      'pump-power': {
        title: 'Potência da Bomba (P)',
        formula: 'P = ρ × g × Q × H / η',
        description: 'A potência da bomba é calculada pelo produto da densidade do fluido (ρ), aceleração da gravidade (g), vazão (Q) e altura manométrica (H), dividido pela eficiência da bomba (η).'
      },
      'npsh': {
        title: 'NPSH Disponível',
        formula: 'NPSH = (Pₐₜₘ - Pᵥ)/(ρg) - hₛ - hₗ',
        description: 'O NPSH disponível é calculado pela diferença entre a pressão atmosférica (Pₐₜₘ) e a pressão de vapor do fluido (Pᵥ), dividida pelo produto da densidade (ρ) e aceleração da gravidade (g), menos a altura de sucção (hₛ) e a perda de carga na linha de sucção (hₗ).'
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
          case 'velocity-flow': return 'm/s';
          case 'pressure': return 'Pa';
          case 'density': return 'kg/m³';
          case 'water-column': return 'm';
          case 'reynolds': return '(adimensional)';
          case 'relative-roughness': return '(adimensional)';
          case 'friction-factor': return '(adimensional)';
          case 'head-loss': return 'm';
          case 'energy-equation': return 'm';
          case 'pump-power': return 'W';
          case 'npsh': return 'm';
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
            <Label className="text-purple-100 text-base">Tipo de Medida</Label>
            <Select value={selectedMeasurement} onValueChange={(val) => {
              handleInputChange('measurementType', val);
            }}>
                <SelectTrigger className="w-full bg-slate-800/50 border-purple-500/30 text-purple-100 focus:border-purple-400 h-12 text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-500/30">
                  {measurementTypes.map(type => (
                    <SelectItem key={type} value={type} className="text-purple-100 focus:bg-purple-500/20 focus:text-purple-100">
                      {measurementTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
            </Select>
           </div>
           
           <div className="flex items-end gap-3">
              <div className="flex-1">
                  <Label htmlFor="value" className="text-purple-100 text-base">Valor para converter</Label>
                  <Input
                    id="value"
                    type="number"
                    step="any"
                    value={inputs.value || ''}
                    onChange={(e) => handleInputChange('value', e.target.value)}
                    className="bg-slate-800/50 border-purple-500/30 text-white focus:border-purple-400 h-12 text-lg"
                    placeholder="Insira o valor"
                  />
              </div>
           </div>

           <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label className="text-purple-100 text-base">De</Label>
                <Select value={inputs.fromUnit || availableUnits[0]} onValueChange={(val) => handleInputChange('fromUnit', val)}>
                    <SelectTrigger className="w-full bg-slate-800/50 border-purple-500/30 text-purple-100 focus:border-purple-400 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-purple-500/30">
                      {availableUnits.map(unit => (
                        <SelectItem key={unit} value={unit} className="text-purple-100 focus:bg-purple-500/20 focus:text-purple-100">{unit}</SelectItem>
                      ))}
                    </SelectContent>
                </Select>
              </div>
              <div className="self-end pb-3 text-purple-400">
                <ChevronsRight size={24}/>
              </div>
              <div className="flex-1">
                <Label className="text-purple-100 text-base">Para</Label>
                <Select value={inputs.toUnit || availableUnits[1] || availableUnits[0]} onValueChange={(val) => handleInputChange('toUnit', val)}>
                    <SelectTrigger className="w-full bg-slate-800/50 border-purple-500/30 text-purple-100 focus:border-purple-400 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-purple-500/30">
                      {availableUnits.map(unit => (
                        <SelectItem key={unit} value={unit} className="text-purple-100 focus:bg-purple-500/20 focus:text-purple-100">{unit}</SelectItem>
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
      'velocity-flow': [
        { 
          field: 'flow', 
          label: 'Vazão (Q)', 
          unitType: 'flow',
          units: ['m³/s', 'm³/h', 'L/s', 'L/min', 'gal/min (US)'],
          defaultUnit: 'm³/s'
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
      'relative-roughness': [
        { 
          field: 'roughness', 
          label: 'Rugosidade Absoluta (ε)', 
          unitType: 'length',
          units: ['m', 'cm', 'mm', 'ft', 'in'],
          defaultUnit: 'mm'
        },
        { 
          field: 'diameter', 
          label: 'Diâmetro da Tubulação (D)', 
          unitType: 'length',
          units: ['m', 'cm', 'mm', 'ft', 'in'],
          defaultUnit: 'm'
        }
      ],
      'friction-factor': [
        { 
          field: 'reynolds', 
          label: 'Número de Reynolds (Re)', 
          unitType: 'dimensionless',
          units: [''],
          defaultUnit: ''
        },
        { 
          field: 'relativeRoughness', 
          label: 'Rugosidade Relativa (ε/D)', 
          unitType: 'dimensionless',
          units: [''],
          defaultUnit: ''
        }
      ],
      'head-loss': [
        { 
          field: 'frictionFactor', 
          label: 'Fator de Atrito (f)', 
          unitType: 'dimensionless',
          units: [''],
          defaultUnit: ''
        },
        { 
          field: 'length', 
          label: 'Comprimento da Tubulação (L)', 
          unitType: 'length',
          units: ['m', 'cm', 'mm', 'ft', 'in'],
          defaultUnit: 'm'
        },
        { 
          field: 'diameter', 
          label: 'Diâmetro da Tubulação (D)', 
          unitType: 'length',
          units: ['m', 'cm', 'mm', 'ft', 'in'],
          defaultUnit: 'm'
        },
        { 
          field: 'velocity', 
          label: 'Velocidade do Escoamento (v)', 
          unitType: 'velocity',
          units: ['m/s', 'km/h', 'ft/s', 'mph'],
          defaultUnit: 'm/s'
        },
        { 
          field: 'kSum', 
          label: 'Soma dos Coeficientes de Perda Localizada (Σk)', 
          unitType: 'dimensionless',
          units: [''],
          defaultUnit: ''
        }
      ],
      'energy-equation': [
        { 
          field: 'z1', 
          label: 'Cota no Ponto 1 (z₁)', 
          unitType: 'length',
          units: ['m', 'cm', 'mm', 'ft', 'in'],
          defaultUnit: 'm'
        },
        { 
          field: 'z2', 
          label: 'Cota no Ponto 2 (z₂)', 
          unitType: 'length',
          units: ['m', 'cm', 'mm', 'ft', 'in'],
          defaultUnit: 'm'
        },
        { 
          field: 'p1', 
          label: 'Pressão no Ponto 1 (P₁)', 
          unitType: 'pressure',
          units: ['Pa', 'kPa', 'bar', 'psi', 'atm'],
          defaultUnit: 'Pa'
        },
        { 
          field: 'p2', 
          label: 'Pressão no Ponto 2 (P₂)', 
          unitType: 'pressure',
          units: ['Pa', 'kPa', 'bar', 'psi', 'atm'],
          defaultUnit: 'Pa'
        },
        { 
          field: 'v1', 
          label: 'Velocidade no Ponto 1 (v₁)', 
          unitType: 'velocity',
          units: ['m/s', 'km/h', 'ft/s', 'mph'],
          defaultUnit: 'm/s'
        },
        { 
          field: 'v2', 
          label: 'Velocidade no Ponto 2 (v₂)', 
          unitType: 'velocity',
          units: ['m/s', 'km/h', 'ft/s', 'mph'],
          defaultUnit: 'm/s'
        },
        { 
          field: 'headLoss', 
          label: 'Perda de Carga Total (hₜ)', 
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
      ],
      'pump-power': [
        { 
          field: 'flow', 
          label: 'Vazão (Q)', 
          unitType: 'flow',
          units: ['m³/s', 'm³/h', 'L/s', 'L/min', 'gal/min (US)'],
          defaultUnit: 'm³/s'
        },
        { 
          field: 'head', 
          label: 'Altura Manométrica (H)', 
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
        },
        { 
          field: 'efficiency', 
          label: 'Eficiência da Bomba (η)', 
          unitType: 'percentage',
          units: ['%'],
          defaultUnit: '%'
        }
      ],
      'npsh': [
        { 
          field: 'atmosphericPressure', 
          label: 'Pressão Atmosférica (Pₐₜₘ)', 
          unitType: 'pressure',
          units: ['Pa', 'kPa', 'bar', 'psi', 'atm'],
          defaultUnit: 'Pa'
        },
        { 
          field: 'vaporPressure', 
          label: 'Pressão de Vapor (Pᵥ)', 
          unitType: 'pressure',
          units: ['Pa', 'kPa', 'bar', 'psi', 'atm'],
          defaultUnit: 'Pa'
        },
        { 
          field: 'suctionHeight', 
          label: 'Altura de Sucção (hₛ)', 
          unitType: 'length',
          units: ['m', 'cm', 'mm', 'ft', 'in'],
          defaultUnit: 'm'
        },
        { 
          field: 'headLoss', 
          label: 'Perda de Carga na Sucção (hₗ)', 
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
            <Label htmlFor={input.field} className="text-purple-100 text-base">
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
                  className="bg-slate-800/50 border-purple-500/30 text-white focus:border-purple-400 h-12 text-lg"
                  placeholder="Insira o valor"
                />
              </div>
              <Select
                value={units[input.field] || input.defaultUnit}
                onValueChange={(value) => handleUnitChange(input.field, value)}
              >
                <SelectTrigger className="w-40 bg-slate-800/50 border-purple-500/30 text-purple-100 focus:border-purple-400 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-500/30">
                  {input.units.map((unit) => (
                    <SelectItem 
                      key={unit} 
                      value={unit}
                      className="text-purple-100 focus:bg-purple-500/20 focus:text-purple-100"
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
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Cabeçalho da página. */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Calculadora de Sistemas Fluidomecânicos
            </h1>
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-purple-400 to-transparent rounded-full" />
          </div>
          <p className="text-purple-100/70 mt-4 text-lg">
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
                      className="group bg-slate-900/50 border-purple-500/20 hover:border-purple-400/50 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 backdrop-blur-sm overflow-hidden relative"
                      onClick={() => handleCategorySelect(category)}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                      
                      <CardHeader>
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-8 h-8 text-purple-400" />
                        </div>
                        <CardTitle className="text-white text-xl group-hover:text-purple-300 transition-colors">
                          {category.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-purple-100/60 group-hover:text-purple-100/80 transition-colors">
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
                className="mb-6 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Categorias
              </Button>

              <Card className="bg-slate-900/70 border-purple-500/30 backdrop-blur-sm shadow-2xl shadow-purple-500/10">
                <CardHeader className="border-b border-purple-500/20 pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedCalculator.color} flex-shrink-0 flex items-center justify-center`}>
                        {React.createElement(selectedCalculator.icon, { className: "w-7 h-7 text-white" })}
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-white">
                          {selectedCalculator.name}
                        </CardTitle>
                        <p className="text-purple-100/60 text-sm mt-1">
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
                    className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-400 hover:to-violet-400 text-white font-semibold py-6 text-lg shadow-lg shadow-purple-500/25"
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
                      className="mt-6 p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-400/30 text-center"
                    >
                      <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center justify-center gap-2">
                        <Zap className="w-5 h-5" />
                        Resultado
                      </h3>
                      
                      <div className="flex items-baseline justify-center gap-3">
                        <div className="text-4xl md:text-5xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-violet-400">
                            {formatResultValue(result.value, selectedCalculator.id)}
                        </div>
                        <span className="text-xl text-purple-400">{getResultUnit(selectedCalculator.id, inputs)}</span>
                      </div>

                      <div className="mt-4 bg-slate-900/50 p-4 rounded-lg font-mono text-purple-100 whitespace-pre-line text-sm md:text-base text-left">
                        {result.explanation}
                      </div>
                    </motion.div>
                  )}

                  <div className="pt-4 border-t border-purple-500/20 flex flex-col items-center">
                    {selectedCalculator.id !== 'unit-conversion' && (
                      <Button variant="outline" size="sm" onClick={() => setShowFormula(!showFormula)} className="bg-transparent border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200">
                          <Info className="w-4 h-4 mr-2"/>
                          {showFormula ? "Ocultar Fórmula" : "Ver Fórmula"}
                      </Button>
                    )}
                    {/* Animação para mostrar/ocultar a explicação da fórmula. */}
                    <AnimatePresence>
                    {showFormula && selectedCalculator.id !== 'unit-conversion' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="w-full mt-4 p-4 rounded-xl bg-slate-800/50 border border-purple-400/20"
                      >
                        <h3 className="text-lg font-semibold text-purple-300 mb-2">
                          {getFormulaExplanation(selectedCalculator.id).title}
                        </h3>
                        <div className="bg-slate-900/50 p-3 rounded-lg font-mono text-center text-purple-100 text-lg mb-3">
                          {getFormulaExplanation(selectedCalculator.id).formula}
                        </div>
                        <p className="text-purple-100/70 text-sm">
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