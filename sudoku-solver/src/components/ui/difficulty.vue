<template>
    <div class="difficulty-container" :style="styleSize">
        <div class="meter-wrapper">
            <svg viewBox="0 0 100 60" class="meter-svg">
                <defs>
                    <path id="arcPath" d="M 10 50 A 40 40 0 0 1 90 50" />
                </defs>
                <use xlink:href="#arcPath" fill="none" stroke="#E5E7EB" stroke-width="12" stroke-linecap="round" />
                <use xlink:href="#arcPath" fill="none" :stroke="(config.color != null ? config.color : '#E5E7EB')" stroke-width="12" stroke-linecap="round":style="progressStyle"class="progress-arc"/>
                <g :style="needleStyle" class="needle-group">
                    <path d="M 50 50 L 15 50" stroke="#9E9E9E" stroke-width="5" stroke-linecap="round" />
                    <circle cx="50" cy="50" r="7" fill="#9E9E9E" />
                </g>
            </svg>
        </div>

        <div v-if="props.text" class="label" :style="{ color: (config.color != null ? config.color : '#FFFFFFFF') }">
            {{ config.label }}
        </div>
    </div>
</template>

<script setup>
    import { computed } from 'vue';

    const props = defineProps({
        v: { 
            type: String,
            default: 'none',
            validator: (val) => ['none', 'easy', 'medium', 'hard', 'extreme'].includes(val)
        },
        size: {type: String, default: "220px"},
        text: {type: Boolean, default: false}
    });

    const styleSize = computed(() => {return {
        "--difficulty-size": props.size
    }});

    // Longueur totale de l'arc (calculée pour un rayon de 40 sur 180°)
    const totalLength = 125.6; 

    const config = computed(() => {
        const mapping = {
            // percent: combien de la jauge est remplie (25% par segment)
            // angle: rotation de l'aiguille (0° = gauche, 180° = droite)
            none:    { label: 'NONE',   color: null, percent: 0, angle: 0 },
            easy:    { label: 'FACILE',   color: '#5CC38D', percent: 0.25, angle: 30 },
            medium:  { label: 'MEDIUM',   color: '#FFD204', percent: 0.50, angle: 75 },
            hard:    { label: 'DIFFICILE', color: '#FE7A37', percent: 0.75, angle: 120 },
            extreme: { label: 'EXTRÊME',   color: '#EF5151', percent: 1.00, angle: 165 }
        };
        return mapping[props.v] || mapping.easy;
    });

    const progressStyle = computed(() => ({
        strokeDasharray: `${config.value.percent * totalLength} ${totalLength}`,
        transition: 'all 0.6s ease-in-out'
    }));

    const needleStyle = computed(() => ({
        transform: `rotate(${config.value.angle}deg)`,
        transformOrigin: '50px 50px',
        transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
    }));
</script>

<style scoped>
    .difficulty-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: var(--difficulty-size);
    }

    .meter-wrapper {
        width: 100%;
    }

    .progress-arc {
        stroke-dashoffset: 0;
    }

    .label {
        margin-top: 5px;
        font-family: 'Arial Black', sans-serif;
        font-weight: 900;
        font-size: 1.5rem;
        letter-spacing: -1px;
    }
</style>