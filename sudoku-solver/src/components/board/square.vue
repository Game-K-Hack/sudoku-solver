<script setup lang="ts">
defineProps({
    number: { type: Number, required: true },
})

</script>

<template>
    <div class="w-6 bg-board-bg text-center border border-board-small-br">
        <p v-if="number">{{ number }}</p>
    </div>
</template>
