import { Dispatch, SetStateAction, createContext, useContext } from "react";

type CameraContextType = {
	mediaBlobURL: string | undefined;
	setMediaBlobURL: React.Dispatch<React.SetStateAction<string | undefined>>;
};
const CameraContext = createContext<CameraContextType>({} as CameraContextType);

export const useCameraContext = () => {
	const context = useContext(CameraContext);
	if (context === undefined) {
		throw new Error("useCameraContext must be used within a CameraProvider");
	}
	return context;
};

export function CameraProvider({
	children,
	setMediaBlobURL,
	mediaBlobURL,
}: {
	children: React.ReactNode;
	mediaBlobURL: string | undefined;
	setMediaBlobURL: Dispatch<SetStateAction<string | undefined>>;
}) {
	return (
		<CameraContext.Provider
			value={{
				mediaBlobURL,
				setMediaBlobURL,
			}}
		>
			{children}
		</CameraContext.Provider>
	);
}
