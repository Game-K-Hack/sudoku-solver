<script setup lang="ts">
  import SudokuBoard from './components/board/sudoku-board.vue';
  import Difficulty from './components/ui/difficulty.vue';
  import SwitchButton from './components/ui/switch-button.vue';

</script>

<template>
  <div class="w-full flex justify-center pt-2">
    <div class="w-126 flex content-center flex-col gap-2">
      <div class="flex justify-between">
        <Difficulty v="easy" size="100px"/>
        <SwitchButton class="content-end"/>
      </div>
      <SudokuBoard/>
    </div>
  </div>
</template>

<style scoped></style>
