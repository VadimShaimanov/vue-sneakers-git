import { watch } from 'vue';
import { cart } from './App.vue';

watch(cart, () => {
localStorage.setItem('cart', JSON.ctringify(cart.value));
},
{ deep: true }
);
