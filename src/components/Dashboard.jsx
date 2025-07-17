import { Card, CardContent } from "@/components/ui/Card";

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold text-gray-700">Connected Devices</h3>
          <p className="text-3xl font-bold text-green-600">1,283</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold text-gray-700">Alerts</h3>
          <p className="text-3xl font-bold text-red-500">27</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold text-gray-700">Devices Offline</h3>
          <p className="text-3xl font-bold text-yellow-500">12</p>
        </CardContent>
      </Card>
    </div>
  );
}
