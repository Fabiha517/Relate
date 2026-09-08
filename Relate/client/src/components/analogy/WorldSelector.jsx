
/** @jsxImportSource react */

import { useEffect, useState } from 'react'
import * as worldsApi from '../../api/worlds.api'

import {Lottie} from 'lottie-react'

import restaurantAnimation from '../../assets/animations/restaurant.json'
import sportsAnimation from '../../assets/animations/sports.json'
import moviesAnimation from '../../assets/animations/movies.json'
import kitchenAnimation from '../../assets/animations/kitchen.json'
import cityAnimation from '../../assets/animations/city.json'
import spaceAnimation from '../../assets/animations/space.json'
import natureAnimation from '../../assets/animations/nature.json'
import factoryAnimation from '../../assets/animations/factory.json'
import libraryAnimation from '../../assets/animations/library.json'

const WORLD_STYLES = {
  Restaurant: {
    color: '#ff5755',
    softColor: '#ffe1df',
    rotate: '-2deg',
    hoverRotate: '0deg',
    description: 'Orders, chefs, kitchen, service',
    illustration: '🍽️',
    accent: '✦',
    animation: restaurantAnimation,
  },

  Sports: {
    color: '#17aaa7',
    softColor: '#d9f5f3',
    rotate: '2deg',
    hoverRotate: '4deg',
    description: 'Teams, plays, strategy, wins',
    illustration: '🏀',
    accent: '●',
    animation: sportsAnimation,
  },

  Movies: {
    color: '#5b38d1',
    softColor: '#e8e1ff',
    rotate: '-2deg',
    hoverRotate: '-4deg',
    description: 'Scenes, roles, plot, direction',
    illustration: '🎬',
    accent: '✦',
    animation: moviesAnimation,
  },

  Kitchen: {
    color: '#f3a400',
    softColor: '#fff0c7',
    rotate: '2deg',
    hoverRotate: '0deg',
    description: 'Recipes, ingredients, cooking, timing',
    illustration: '🥣',
    accent: '✦',
    animation: kitchenAnimation,
  },

  City: {
    color: '#3478c8',
    softColor: '#dfeeff',
    rotate: '-2deg',
    hoverRotate: '-4deg',
    description: 'Roads, places, people, connections',
    illustration: '🏙️',
    accent: '●',
    animation: cityAnimation,
  },

  Space: {
    color: '#253b70',
    softColor: '#e0e7fa',
    rotate: '2deg',
    hoverRotate: '0deg',
    description: 'Planets, orbits, gravity, exploration',
    illustration: '🚀',
    accent: '✦',
    animation: spaceAnimation,
  },

  Nature: {
    color: '#5d9b55',
    softColor: '#e2f2df',
    rotate: '-2deg',
    hoverRotate: '-4deg',
    description: 'Plants, ecosystems, growth, balance',
    illustration: '🌿',
    accent: '●',
    animation: natureAnimation,
  },

  Factory: {
    color: '#7b6b61',
    softColor: '#ebe6e2',
    rotate: '2deg',
    hoverRotate: '4deg',
    description: 'Machines, processes, production, flow',
    illustration: '⚙️',
    accent: '✦',
    animation: factoryAnimation,
  },

  Library: {
    color: '#c46b48',
    softColor: '#f8e4dc',
    rotate: '-2deg',
    hoverRotate: '0deg',
    description: 'Books, shelves, knowledge, organization',
    illustration: '📚',
    accent: '●',
    animation: libraryAnimation,
  },
}

const FALLBACK_STYLE = {
  color: '#5424c7',
  softColor: '#e8e1ff',
  rotate: '0deg',
  hoverRotate: '-2deg',
  description: 'A familiar world for understanding',
  illustration: '✦',
  accent: '✦',
  animation: null,
}

function getWorldStyle(world) {
  return WORLD_STYLES[world] || FALLBACK_STYLE
}

export default function WorldSelector({
  value = null,
  onChange = () => {},
  onSubmit = () => {},
  loading = false,
  error = null,
  disabled = false,
}) {
  const [worlds, setWorlds] = useState([])
  const [worldsLoading, setWorldsLoading] = useState(true)
  const [worldsError, setWorldsError] = useState(null)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    async function fetchWorlds() {
      try {
        setWorldsLoading(true)
        setWorldsError(null)

        const response = await worldsApi.getWorlds()

        setWorlds(response.worlds || [])
      } catch (err) {
        console.error('Failed to fetch worlds:', err)

        setWorldsError(
          'Failed to load analogy worlds. Please refresh the page.'
        )
      } finally {
        setWorldsLoading(false)
      }
    }

    fetchWorlds()
  }, [])

  const isEmpty = !value
  const showError = touched && isEmpty

  function handleWorldSelect(world) {
    if (disabled || loading) return

    setTouched(true)
    onChange(world)
  }

  function handleSubmit(event) {
    event.preventDefault()

    setTouched(true)

    if (isEmpty) {
      return
    }

    onSubmit(value)
  }

  if (worldsLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center rounded-[20px] border-2 border-[#071a38]/10 bg-[#fffaf1]/70 px-6 py-10">
          <div className="flex items-center gap-3 text-sm font-bold text-[#526477]">
            <div className="h-5 w-5 animate-spin rounded-full border-[3px] border-[#d8cff4] border-t-[#5424c7]" />
            Loading worlds...
          </div>
        </div>
      </div>
    )
  }

  if (worldsError) {
    return (
      <div className="w-full">
        <div className="rounded-[20px] border-2 border-[#ff5755] bg-[#fff0ee] px-5 py-4 text-sm font-bold text-[#a52d2b]">
          {worldsError}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">

      {/* WORLD GRID */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

        {worlds.map((world) => {
          const style = getWorldStyle(world)
          const selected = value === world

          return (
            <button
              key={world}
              type="button"
              onClick={() => handleWorldSelect(world)}
              disabled={disabled || loading}
              aria-pressed={selected}
              className="
                group
                relative
                min-h-[265px]
                overflow-hidden
                rounded-[20px]
                border-2
                border-[#071a38]
                p-4
                text-left
                shadow-[5px_6px_0_rgba(7,26,56,0.10)]
                transition-all
                duration-200
                hover:-translate-y-2
                hover:shadow-[7px_9px_0_rgba(7,26,56,0.14)]
                active:translate-y-0
                disabled:cursor-wait
                disabled:opacity-60
                sm:min-h-[275px]
              "
              style={{
                backgroundColor: selected
                  ? style.color
                  : '#fffaf1',

                transform: selected
                  ? 'translateY(-4px) rotate(0deg)'
                  : `rotate(${style.rotate})`,
              }}
            >

              {/* Decorative background circle */}
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-8
                  -top-8
                  h-28
                  w-28
                  rounded-full
                  opacity-70
                  transition-transform
                  duration-300
                  group-hover:scale-125
                "
                style={{
                  backgroundColor: selected
                    ? 'rgba(255,255,255,0.20)'
                    : style.softColor,
                }}
              />

              {/* Selected badge */}
              {selected && (
                <div
                  className="
                    absolute
                    right-4
                    top-4
                    z-20
                    rounded-full
                    bg-white/90
                    px-2.5
                    py-1
                    text-[9px]
                    font-black
                    uppercase
                    tracking-wider
                    text-[#071a38]
                    shadow-[2px_2px_0_rgba(7,26,56,0.15)]
                  "
                >
                  Selected
                </div>
              )}

              {/* LOTTIE AREA */}
              <div
                className="
                  relative
                  z-10
                  flex
                  h-[125px]
                  w-full
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-[16px]
                  transition-transform
                  duration-300
                  group-hover:scale-[1.03]
                "
                style={{
                  backgroundColor: selected
                    ? 'rgba(255,255,255,0.14)'
                    : style.softColor,
                }}
              >
                {style.animation ? (
                  <Lottie
                    src={style.animation}
                    loop={true}
                    autoplay={true}
                    className="h-full w-full"
                  />
                ) : (
                  <span
                    className="
                      text-[56px]
                      transition-transform
                      duration-300
                      group-hover:scale-110
                      group-hover:-rotate-3
                    "
                    role="img"
                    aria-hidden="true"
                  >
                    {style.illustration}
                  </span>
                )}
              </div>

              {/* Divider */}
              <div
                className="
                  relative
                  z-10
                  my-3
                  h-[2px]
                  w-full
                  rounded-full
                "
                style={{
                  backgroundColor: selected
                    ? 'rgba(255,255,255,0.28)'
                    : 'rgba(7,26,56,0.10)',
                }}
              />

              {/* WORLD INFORMATION */}
              <div className="relative z-10">

                {/* Icon + world name */}
                <div className="flex items-center gap-2">

                  <span
                    className="
                      text-[21px]
                      leading-none
                      transition-transform
                      duration-300
                      group-hover:scale-110
                      group-hover:-rotate-3
                    "
                    role="img"
                    aria-hidden="true"
                  >
                    {style.illustration}
                  </span>

                  <h3
                    className="
                      text-[17px]
                      font-black
                      uppercase
                      leading-[19px]
                      tracking-tight
                      transition-transform
                      duration-200
                      group-hover:translate-x-1
                    "
                    style={{
                      color: '#071a38',
                    }}
                  >
                    {world}
                  </h3>
                </div>

                {/* Description */}
                <p
                  className="
                    mt-1.5
                    max-w-[90%]
                    text-[12px]
                    font-semibold
                    leading-[16px]
                  "
                  style={{
                    color: selected
                      ? 'rgba(7,26,56,0.82)'
                      : '#526477',
                  }}
                >
                  {style.description}
                </p>
              </div>

              {/* Small decorative accent */}
              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-4
                  right-5
                  text-[13px]
                  font-black
                  transition-transform
                  duration-300
                  group-hover:scale-125
                  group-hover:rotate-12
                "
                style={{
                  color: selected ? '#fff' : style.color,
                }}
              >
                {style.accent}
              </div>

              {/* Small decorative dot */}
              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-4
                  left-4
                  h-2
                  w-2
                  rounded-full
                "
                style={{
                  backgroundColor: selected
                    ? '#fff'
                    : style.color,
                }}
              />
            </button>
          )
        })}
      </div>

      {/* VALIDATION ERROR */}
      {showError && (
        <div className="mt-4 rounded-[14px] border-2 border-[#ff5755] bg-[#fff0ee] px-4 py-3 text-sm font-bold text-[#a52d2b]">
          Please select an analogy world.
        </div>
      )}

      {/* API / GENERATION ERROR */}
      {error && (
        <div className="mt-4 rounded-[14px] border-2 border-[#ff5755] bg-[#fff0ee] px-4 py-3 text-sm font-bold text-[#a52d2b]">
          {error.message || error}
        </div>
      )}

      {/* GENERATE BUTTON */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || loading || isEmpty}
          className="
            rounded-[14px]
            border-2
            border-[#071a38]
            bg-[#5424c7]
            px-6
            py-3
            text-sm
            font-black
            uppercase
            tracking-wide
            text-white
            shadow-[4px_5px_0_rgba(7,26,56,0.18)]
            transition-all
            duration-200
            hover:-translate-y-1
            hover:shadow-[5px_7px_0_rgba(7,26,56,0.20)]
            active:translate-y-0
            disabled:cursor-wait
            disabled:opacity-60
          "
        >
          {loading ? 'Generating...' : 'Generate Analogy'}
        </button>
      </div>
    </div>
  )
}

