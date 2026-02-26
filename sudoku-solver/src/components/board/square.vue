<script setup lang="ts">
    import { computed } from 'vue';
    import { SquareState, type SquareModel } from '../../types';

    const props = defineProps<{
        square: SquareModel, 
    }>();

    const stateClass = computed(() => {
        switch (props.square.state) {
            case SquareState.ROW:
                return 'bg-sudoku-square-row';
            case SquareState.ERROR:
                return 'bg-sudoku-square-error';
            case SquareState.CLICKED:
                return 'bg-sudoku-square-clicked';
            default:
                return 'bg-sudoku-square-default';
        }
    });
</script>

<template>
    <div class="w-14 h-14 flex justify-center items-baseline border border-board-small-br font-sudoku-number font-bold" :class="stateClass">
        <p class="text-3xl text-center" :class="(square.isInital ? '': 'text-primary')" v-if="square.value">{{ square.value }}</p>
    </div>
</template>
