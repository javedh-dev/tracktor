<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { t } from '$lib/stores/i18n';

  // Usar $props() en lugar de export let para Svelte 5
  const { value = '#000000', label = '', required = false } = $props<{
    value?: string;
    label?: string;
    required?: boolean;
  }>();

  const dispatch = createEventDispatcher<{ change: string }>();

  // Colores comunes para vehículos
  const commonColors = [
    { name: 'Blanco', hex: '#FFFFFF' },
    { name: 'Negro', hex: '#000000' },
    { name: 'Gris', hex: '#808080' },
    { name: 'Plata', hex: '#C0C0C0' },
    { name: 'Rojo', hex: '#FF0000' },
    { name: 'Azul', hex: '#0000FF' },
    { name: 'Verde', hex: '#008000' },
    { name: 'Amarillo', hex: '#FFFF00' },
    { name: 'Naranja', hex: '#FFA500' },
    { name: 'Marrón', hex: '#8B4513' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Dorado', hex: '#FFD700' }
  ];

  let selectedColor = $state(value);
  let showAdvanced = $state(false);
  let hue = $state(0);
  let saturation = $state(100);
  let lightness = $state(50);
  let manualHex = $state(value);

  // Convertir hex a HSL
  function hexToHsl(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  // Convertir HSL a hex
  function hslToHex(h: number, s: number, l: number): string {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // Inicializar valores cuando cambia el prop value
  $effect(() => {
    if (value && value !== selectedColor) {
      selectedColor = value;
      manualHex = value;
      [hue, saturation, lightness] = hexToHsl(value);
    }
  });

  function selectCommonColor(hex: string) {
    selectedColor = hex;
    manualHex = hex;
    [hue, saturation, lightness] = hexToHsl(hex);
    dispatch('change', hex);
  }

  function updateFromSliders() {
    const newColor = hslToHex(hue, saturation, lightness);
    selectedColor = newColor;
    manualHex = newColor;
    dispatch('change', newColor);
  }

  function updateFromManual() {
    if (/^#[0-9A-F]{6}$/i.test(manualHex)) {
      selectedColor = manualHex;
      [hue, saturation, lightness] = hexToHsl(manualHex);
      dispatch('change', manualHex);
    }
  }
</script>

<div class="color-picker">
  {#if label}
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label}
      {#if required}<span class="text-red-500">*</span>{/if}
    </label>
  {/if}

  <!-- Vista previa del color seleccionado -->
  <div class="flex items-center gap-3 mb-4">
    <div 
      class="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm"
      style="background-color: {selectedColor || '#000000'}"
    ></div>
    <div class="flex-1">
      <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {$t('colorPicker.selectedColor')}
      </div>
      <div class="text-xs text-gray-500 dark:text-gray-400 font-mono">
        {selectedColor?.toUpperCase() || '#000000'}
      </div>
    </div>
  </div>

  <!-- Paleta de colores comunes -->
  <div class="mb-4">
    <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {$t('colorPicker.commonColors')}
    </h4>
    <div class="grid grid-cols-6 gap-2">
      {#each commonColors as color}
        <button
          type="button"
          class="w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
          class:border-blue-500={selectedColor === color.hex}
          class:border-gray-300={selectedColor !== color.hex}
          style="background-color: {color.hex}"
          title="{color.name} ({color.hex})"
          on:click={() => selectCommonColor(color.hex)}
        ></button>
      {/each}
    </div>
  </div>

  <!-- Toggle para opciones avanzadas -->
  <button
    type="button"
    class="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-3"
    on:click={() => showAdvanced = !showAdvanced}
  >
    {showAdvanced ? $t('colorPicker.hideAdvanced') : $t('colorPicker.showAdvanced')}
  </button>

  {#if showAdvanced}
    <div class="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <!-- Slider de Matiz -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {$t('colorPicker.hue')}: {hue}°
        </label>
        <input
          type="range"
          min="0"
          max="360"
          bind:value={hue}
          on:input={updateFromSliders}
          class="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style="background: linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)"
        />
      </div>

      <!-- Slider de Saturación -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {$t('colorPicker.saturation')}: {saturation}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          bind:value={saturation}
          on:input={updateFromSliders}
          class="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style="background: linear-gradient(to right, hsl({hue}, 0%, {lightness}%), hsl({hue}, 100%, {lightness}%))"
        />
      </div>

      <!-- Slider de Luminosidad -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {$t('colorPicker.lightness')}: {lightness}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          bind:value={lightness}
          on:input={updateFromSliders}
          class="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style="background: linear-gradient(to right, hsl({hue}, {saturation}%, 0%), hsl({hue}, {saturation}%, 50%), hsl({hue}, {saturation}%, 100%))"
        />
      </div>

      <!-- Entrada manual -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {$t('colorPicker.hexCode')}
        </label>
        <input
          type="text"
          bind:value={manualHex}
          on:blur={updateFromManual}
          on:keydown={(e) => e.key === 'Enter' && updateFromManual()}
          placeholder="#000000"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
        />
      </div>
    </div>
  {/if}
</div>

<style>
  .color-picker {
    @apply w-full;
  }
  
  /* Estilos para los sliders */
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
  }
  
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #333;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #333;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
</style>