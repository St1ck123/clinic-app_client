import real from "./real"

const USE_MOCK = false

const api = USE_MOCK
  ? mock
  : real

export default api