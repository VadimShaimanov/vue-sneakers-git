<script setup>
import { reactive, watch, ref, onMounted } from 'vue'
import axios from 'axios'
import debounce from 'lodash.debounce'
import { inject } from 'vue'
import CardList from '../components/CardList.vue'

const { cart, addToCart, removeFromCart } = inject('cart')

const items = ref([])

const filters = reactive({
  sortBy: 'title',
  searchQuery: ''
})

const onclickAddPlus = (item) => {
  if (!item.isAdded) {
    addToCart(item)
  } else {
    removeFromCart(item)
  }
}

const onChangeSelect = (event) => {
  filters.sortBy = event.target.value
}

const onChangeSearchInput = debounce((event) => {
  filters.searchQuery = event.target.value
}, 500)

const addToFavorite = async (item) => {
  try {
    if (!item.isFavorite) {
      const obj = {
        item_id: item.id
      }

      item.isFavorite = true

      const { data } = await axios.post(`https://56e0033a46382b20.mokky.dev/favorites`, obj)

      item.favoriteId = data.id
    } else {
      item.isFavorite = false
      await axios.delete(`https://56e0033a46382b20.mokky.dev/favorites/${item.favoriteId}`)
      item.favorite = null
    }
  } catch (err) {
    console.log(err)
  }
}

const fetchFaforites = async () => {
  try {
    const { data: favorites } = await axios.get(`https://56e0033a46382b20.mokky.dev/favorites`)

    items.value = items.value.map((item) => {
      const favorite = favorites.find((favorite) => favorite.item_id === item.id)

      if (!favorite) {
        return item
      }

      return {
        ...item,
        isFavorite: true,
        favoriteId: favorite.id
      }
    })
  } catch (err) {
    console.log(err)
  }
}

const fetchItems = async () => {
  try {
    const params = {
      sortBy: filters.sortBy
    }

    if (filters.searchQuery) {
      params.title = `*${filters.searchQuery}*`
    }

    const { data } = await axios.get(`https://56e0033a46382b20.mokky.dev/items`, {
      params
    })
    items.value = data.map((obj) => ({
      ...obj,
      isFavorites: false,
      favoriteId: null,
      isAdded: false
    }))
  } catch (err) {
    console.log(err)
  }
}

onMounted(async () => {
  const localCart = localStorage.getItem('cart')
  cart.value = localCart ? JSON.parse(localCart) : []

  await fetchItems()
  await fetchFaforites()

  items.value = items.value.map((item) => ({
    ...item,
    isAdded: cart.value.some((cartItem) => cartItem.id === item.id)
  }))
})

watch(cart, () => {
  items.value = items.value.map((item) => ({
    ...item,
    isAdded: false
  }))
})

watch(filters, fetchItems)
</script>

<template>

  <div class="pb-10">
    <img class="w-full" src="/Kermit-x2.png" alt="Kermit" />
  </div>

  <div class="flex flex-col md:flex-row justify-between items-center">
    <h2 class="text-2xl md:text-3xl font-bold mb-8">Все кроссовки</h2>

    <div class="flex flex-col  md:flex-row gap-4">
      <select @change="onChangeSelect" class="py-2 px-3 border rounded-md outline-none">
        <option value="name">По названию</option>
        <option value="price">По цене (дешевле)</option>
        <option value="-price">По цене (дороже)</option>
      </select>

      <div class="relative">
        <img class="absolute left-4 top-3" src="/search.svg" alt="" />
        <input
          @input="onChangeSearchInput"
          class="border rounded-md py-2 pl-10 pr-4 outline-none focus:border-gray-400"
          type="text"
          placeholder="Поиск..."
        />
      </div>
    </div>

  </div>

  <div class="mt-10">
    <CardList :items="items" @add-to-favorite="addToFavorite" @add-to-cart="onclickAddPlus" />
  </div>
</template>
