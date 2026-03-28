import { openDB, type IDBPDatabase } from 'idb'
import type { PuzzleData } from '../lib/types'

const DB_NAME = 'color-by-number-db'
const DB_VERSION = 1
const STORE_NAME = 'puzzles'

interface PuzzleDB {
  puzzles: {
    key: string
    value: PuzzleData
    indexes: { createdAt: number }
  }
}

let dbPromise: Promise<IDBPDatabase<PuzzleDB>> | null = null

function getDB(): Promise<IDBPDatabase<PuzzleDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PuzzleDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('createdAt', 'createdAt')
      },
    })
  }
  return dbPromise
}

export function useDB() {
  async function savePuzzle(puzzle: PuzzleData): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAME, puzzle)
  }

  async function getPuzzle(id: string): Promise<PuzzleData | undefined> {
    const db = await getDB()
    return db.get(STORE_NAME, id)
  }

  async function getAllPuzzles(): Promise<PuzzleData[]> {
    const db = await getDB()
    const all = await db.getAll(STORE_NAME)
    return all.sort((a, b) => b.createdAt - a.createdAt)
  }

  async function updateProgress(id: string, progress: Uint8Array, completed: boolean = false): Promise<void> {
    const db = await getDB()
    const puzzle = await db.get(STORE_NAME, id)
    if (puzzle) {
      puzzle.progress = progress
      puzzle.completed = completed
      await db.put(STORE_NAME, puzzle)
    }
  }

  async function deletePuzzle(id: string): Promise<void> {
    const db = await getDB()
    await db.delete(STORE_NAME, id)
  }

  return { savePuzzle, getPuzzle, getAllPuzzles, updateProgress, deletePuzzle }
}
