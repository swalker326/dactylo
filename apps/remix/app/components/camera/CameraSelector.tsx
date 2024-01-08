import { Camera } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem
} from "~/components/ui/select";

export function CameraSelector({
  onSelect,
  devices
}: {
  devices: MediaDeviceInfo[];
  onSelect: (deviceId: string) => Promise<void>;
}) {
  return (
    <div className="z-20 flex items-center">
      <Select
        defaultValue={devices[0].deviceId}
        onValueChange={(e) => onSelect(e)}
      >
        <SelectTrigger className="text-black">
          <Camera size={23} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Devices</SelectLabel>
            {devices?.map((device) => {
              return (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
