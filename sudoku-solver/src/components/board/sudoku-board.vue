<script setup lang="ts">
    import Square from './square.vue';

    const matrix = new Array(9).fill(new Array(9).fill(1));

    const flat_matrix = matrix.flat();
</script>

<template>
    <div class="grid grid-rows-9 grid-cols-9 w-fit">
        <Square v-for="square in flat_matrix" :number="square" />
    </div>
</template>
