import { createContext, useState } from "react";

export const ContextStore = createContext({});

export const ContextStoreProvider = (props) => {
  const [collegeName, setCollegeName] = useState("");
  return (
    <ContextStore.Provider value={{ collegeName, setCollegeName }}>
      {props.children}
    </ContextStore.Provider>
  );
};
