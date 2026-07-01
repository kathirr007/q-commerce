<template>
  <div ref="mapContainer" class="h-64 w-full rounded-lg border border-gray-200 dark:border-gray-800" />
</template>

<script setup lang="ts">
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const props = defineProps<{
  stores: any[]
}>()

const mapContainer = ref<HTMLElement>()
let map: maplibregl.Map | null = null

onMounted(() => {
  if (!mapContainer.value) return

  const m = new maplibregl.Map({
    container: mapContainer.value,
    style: 'https://demotiles.maplibre.org/style.json',
    center: [78.9629, 20.5937],
    zoom: 4
  })
  map = m

  m.addControl(new maplibregl.NavigationControl(), 'top-right')

  props.stores.forEach((store) => {
    const loc = store.location
    if (!loc?.lng || !loc?.lat) return

    const el = document.createElement('div')
    el.className = 'flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold shadow-lg cursor-pointer'
    el.textContent = 'S'

    new maplibregl.Marker({ element: el })
      .setLngLat([loc.lng, loc.lat])
      .setPopup(new maplibregl.Popup().setText(store.name))
      .addTo(m)
  })
})

onUnmounted(() => {
  if (map) map.remove()
})
</script>
