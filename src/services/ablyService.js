import Ably from "ably";

const ablyAPI = new Ably.Realtime({
  key: "zA9pYA.wj0yaQ:9RlIUknm_rfW2k9EpmetVNrFJHt0yUOZ0I4IZpw1wEs",
});
let channel;

const connectAbly = () => {
  ablyAPI.connection.once("connected", () => {
   
  });
  channel = ablyAPI.channels.get("public:sensor-channel");
};

const subscribeToChannel = (callback) => {
  if (!channel) connectAbly();
  channel.subscribe("event_name", (message) => {
    const incomingData = message.data?.comment;
    callback(incomingData);
  });
};

const unsubscribeFromChannel = () => {
  if (channel) channel.unsubscribe();
};

export default {
  connectAbly,
  subscribeToChannel,
  unsubscribeFromChannel,
};
