import React, { useState, useEffect, useRef } from "react";
import {
  Server,
  Play,
  RotateCw,
  Square,
  Skull,
  Terminal,
  Folder,
  FileCode,
  Boxes,
  Users,
  Sliders,
  HardDrive,
  Cpu,
  Activity,
  Globe,
  Copy,
  Check,
  Trash2,
  Send,
  Plus,
  Save,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export interface PterodactylPanelProps {
  onBackToClient?: () => void;
}

type TabType = "console" | "files" | "plugins" | "players" | "config" | "backups" | "bootstrap";

interface ServerFile {
  name: string;
  type: "file" | "dir";
  size: string;
  modified: string;
  path: string;
  content?: string;
}

interface PaperPlugin {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: string;
  installed: boolean;
  enabled: boolean;
  iconColor: string;
  recommendedForCracked?: boolean;
}

interface OnlinePlayer {
  uuid: string;
  username: string;
  ping: number;
  gamemode: "survival" | "creative" | "adventure" | "spectator";
  dimension: "overworld" | "nether" | "the_end";
  isOp: boolean;
  isCracked: boolean;
  ip: string;
}

export const PterodactylPanel: React.FC<PterodactylPanelProps> = ({ onBackToClient }) => {
  const [activeTab, setActiveTab] = useState<TabType>("console");
  const [selectedInstance, setSelectedInstance] = useState<"overworld" | "nether_end" | "velocity">("overworld");
  const [serverState, setServerState] = useState<"RUNNING" | "STARTING" | "STOPPING" | "OFFLINE">("RUNNING");

  // Power state message & uptime
  const [uptimeSeconds, setUptimeSeconds] = useState(51842);
  const [cpuUsage, setCpuUsage] = useState(24.5);
  const [memoryUsedMb, setMemoryUsedMb] = useState(3480);
  const memoryLimitMb = 8192;
  const [diskUsedGb] = useState(2.4);
  const diskLimitGb = 30.0;
  const [netRxKbps, setNetRxKbps] = useState(820);
  const [netTxKbps, setNetTxKbps] = useState(3150);

  // Live Console State
  const [commandInput, setCommandInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const consoleBottomRef = useRef<HTMLDivElement>(null);
  const [consoleLogs, setConsoleLogs] = useState<
    Array<{ id: string; time: string; source: string; level: string; text: string }>
  >([
    {
      id: "1",
      time: "14:00:01",
      source: "Paper",
      level: "INFO",
      text: "Starting minecraft server version 1.20.4 (PaperMC build #498)",
    },
    {
      id: "2",
      time: "14:00:02",
      source: "Paper",
      level: "WARN",
      text: "**** SERVER IS RUNNING IN OFFLINE/INSECURE MODE! ****",
    },
    {
      id: "3",
      time: "14:00:02",
      source: "Paper",
      level: "INFO",
      text: "The server will make no attempt to authenticate usernames. Beware.",
    },
    {
      id: "4",
      time: "14:00:03",
      source: "Paper",
      level: "INFO",
      text: "Loading modern Velocity proxy forwarding (online-mode=false, secret verification active)",
    },
    {
      id: "5",
      time: "14:00:05",
      source: "Paper",
      level: "INFO",
      text: "Preparing start region for dimension minecraft:overworld",
    },
    {
      id: "6",
      time: "14:00:08",
      source: "Paper",
      level: "INFO",
      text: 'Time elapsed: 4832 ms. Done (6.124s)! For help, type "help"',
    },
    {
      id: "7",
      time: "14:00:10",
      source: "Paper",
      level: "INFO",
      text: "HuskSync connected to distributed storage backend.",
    },
    {
      id: "8",
      time: "14:02:15",
      source: "Velocity",
      level: "INFO",
      text: "[Connected] Cracked player 'ShadowCrafter_99' connected via Playit Anycast (mc.peercraft.live)",
    },
    {
      id: "9",
      time: "14:02:16",
      source: "Paper",
      level: "INFO",
      text: "ShadowCrafter_99[/127.0.0.1:53120] logged in with entity id 104 at ([world] 128.5, 72.0, -45.2)",
    },
  ]);

  // File Manager State
  const initialFiles: ServerFile[] = [
    {
      name: "server.properties",
      type: "file",
      size: "707 B",
      modified: "Just now",
      path: "/server.properties",
      content: `# ==============================================================================
# PeerCraft Primary Node (Overworld Instance) Server Properties
# ==============================================================================
server-port=25565
online-mode=false
enforce-secure-profile=false
allow-nether=true
allow-end=true
view-distance=8
simulation-distance=6
network-compression-threshold=256
max-players=20
enable-rcon=true
rcon.port=25575
rcon.password=PEERCRAFT_INTERNAL_RCON_PASS_SECURE
sync-chunk-writes=true
level-name=world
gamemode=survival
difficulty=hard
spawn-protection=0
enable-command-block=true
white-list=false
enforce-whitelist=false
max-world-size=29999984
hide-online-players=false
enable-status=true
rate-limit=0
motd=\\u00A7b\\u00A7lPeerCraft\\u00A7r \\u00A77- \\u00A7aAsymmetric Distributed Cluster \\u00A7e[Cracked OK]`,
    },
    {
      name: "paper-global.yml",
      type: "file",
      size: "554 B",
      modified: "2 mins ago",
      path: "/config/paper-global.yml",
      content: `# ==============================================================================
# PeerCraft Paper Global Configuration Template
# ==============================================================================

proxies:
  bungee-cord:
    online-mode: false
  velocity:
    enabled: true
    online-mode: false
    secret: "PEERCRAFT_SHARED_VELOCITY_SECRET_KEY_HEX"

timings:
  enabled: false
  verbose: false

chunk-loading-advanced:
  auto-config-send-distance: true

unsupported-settings:
  allow-piston-duplication: false
  allow-headless-break: false`,
    },
    {
      name: "velocity.toml",
      type: "file",
      size: "781 B",
      modified: "5 mins ago",
      path: "/velocity.toml",
      content: `[servers]
overworld = "127.0.0.1:25565"
nether_end = "127.0.0.1:25566"

try = ["overworld"]

[forced-hosts]
"mc.peercraft.live" = ["overworld"]

bind = "0.0.0.0:25577"
motd = "<gradient:#4facfe:#00f2fe>PeerCraft Asymmetric Dynamic Cluster [Cracked Supported]</gradient>"
show-max-players = 20
online-mode = false
force-key-authentication = false
player-info-forwarding-mode = "modern"
forwarding-secret-file = "velocity.secret"
announce-forge = false

[advanced]
compression-threshold = 256
compression-level = -1
login-ratelimit = 3000
connection-timeout = 5000
read-timeout = 30000`,
    },
    {
      name: "bukkit.yml",
      type: "file",
      size: "1.2 KB",
      modified: "1 hour ago",
      path: "/bukkit.yml",
      content: `settings:
  allow-end: true
  warn-on-overload: true
  permissions-file: permissions.yml
  update-folder: update
  plugin-profiling: false
  connection-throttle: 4000
  query-plugins: true
  deprecated-verbose: default
  shutdown-message: Server closed
spawn-limits:
  monsters: 70
  animals: 10
  water-animals: 5
  water-ambient: 20
  ambient: 15
chunk-gc:
  period-in-ticks: 600
ticks-per:
  animal-spawns: 400
  monster-spawns: 1
  autosave: 6000`,
    },
    {
      name: "spigot.yml",
      type: "file",
      size: "2.4 KB",
      modified: "1 hour ago",
      path: "/spigot.yml",
      content: `config-version: 12
settings:
  debug: false
  bungeecord: false
  save-user-cache-on-stop-only: false
  sample-count: 12
  player-shuffle: 0
  user-cache-size: 1000
  moved-wrongly-threshold: 0.0625
  moved-too-quickly-multiplier: 10.0
  log-villager-deaths: true
  log-named-deaths: true
messages:
  whitelist: You are not whitelisted on this server!
  unknown-command: Unknown command. Type "/help" for help.
  server-full: The server is full!
  outdated-client: Outdated client! Please use 1.20.4
  outdated-server: Outdated server! I'm still on 1.20.4
  restart: Server is restarting`,
    },
    {
      name: "eula.txt",
      type: "file",
      size: "24 B",
      modified: "Yesterday",
      path: "/eula.txt",
      content: `#By changing the setting below to TRUE you are indicating your agreement to our EULA
eula=true`,
    },
    {
      name: "ops.json",
      type: "file",
      size: "156 B",
      modified: "Today",
      path: "/ops.json",
      content: `[
  {
    "uuid": "00000000-0000-0000-0009-01f81014e304",
    "name": "ServerAdmin",
    "level": 4,
    "bypassesPlayerLimit": true
  }
]`,
    },
    {
      name: "whitelist.json",
      type: "file",
      size: "2 B",
      modified: "Today",
      path: "/whitelist.json",
      content: `[]`,
    },
    {
      name: "plugins",
      type: "dir",
      size: "4 items",
      modified: "Today",
      path: "/plugins",
    },
    {
      name: "world",
      type: "dir",
      size: "428 MB",
      modified: "10 mins ago",
      path: "/world",
    },
    {
      name: "logs",
      type: "dir",
      size: "12 files",
      modified: "Just now",
      path: "/logs",
    },
  ];

  const [filesList, setFilesList] = useState<ServerFile[]>(initialFiles);
  const [selectedFile, setSelectedFile] = useState<ServerFile | null>(initialFiles[0]);
  const [editorContent, setEditorContent] = useState(initialFiles[0].content || "");
  const [fileSaveToast, setFileSaveToast] = useState(false);

  // Plugin Manager State
  const [pluginsList, setPluginsList] = useState<PaperPlugin[]>([
    {
      id: "skins-restorer",
      name: "SkinsRestorer",
      version: "15.0.3",
      author: "xknifer / SRTeam",
      description:
        "Restores custom skins for cracked / offline-mode players (TLauncher, SKLauncher). Essential for cracked servers!",
      category: "Aesthetics / Cracked",
      installed: true,
      enabled: true,
      iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      recommendedForCracked: true,
    },
    {
      id: "authme-reloaded",
      name: "AuthMe Reloaded",
      version: "5.6.0",
      author: "AuthMe-Team",
      description:
        "In-game password login & registration security for offline/cracked servers (/register, /login).",
      category: "Security / Cracked",
      installed: true,
      enabled: true,
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      recommendedForCracked: true,
    },
    {
      id: "husksync",
      name: "HuskSync",
      version: "3.4.1",
      author: "WiIIiam278",
      description:
        "Cross-server player data synchronizer (Inventories, Ender Chests, Health, Exp) across Overworld and Nether/End shards.",
      category: "Sharding / Cluster",
      installed: true,
      enabled: true,
      iconColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    },
    {
      id: "luckperms",
      name: "LuckPerms",
      version: "5.4.102",
      author: "Luck",
      description: "Industry standard permissions management system with web editor and fast SQL sync.",
      category: "Permissions",
      installed: true,
      enabled: true,
      iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    },
    {
      id: "chunky",
      name: "Chunky",
      version: "1.4.10",
      author: "pop4959",
      description:
        "Pre-generates chunks rapidly to eliminate runtime world exploration lag on peer machines.",
      category: "Optimization",
      installed: true,
      enabled: true,
      iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    },
    {
      id: "spark",
      name: "Spark Profiler",
      version: "1.10.53",
      author: "Luck",
      description:
        "Performance profiling tool to diagnose TPS drops, CPU bottlenecks, and memory leak analysis.",
      category: "Diagnostics",
      installed: true,
      enabled: true,
      iconColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    },
    {
      id: "essentialsx",
      name: "EssentialsX",
      version: "2.20.1",
      author: "EssentialsX Team",
      description:
        "Essential suite of over 100+ commands: /tp, /warp, /spawn, economy, kits, and user management.",
      category: "Gameplay",
      installed: false,
      enabled: false,
      iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    },
    {
      id: "geysermc",
      name: "GeyserMC & Floodgate",
      version: "2.2.2",
      author: "GeyserMC",
      description:
        "Allows Minecraft Bedrock Edition (iOS, Android, Xbox, Switch, PS4) players to join PaperMC Java.",
      category: "Cross-Play",
      installed: false,
      enabled: false,
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
    {
      id: "viaversion",
      name: "ViaVersion",
      version: "4.9.2",
      author: "ViaVersion Team",
      description:
        "Enables older and newer client versions (1.16 through 1.21+) to connect seamlessly to Paper 1.20.4.",
      category: "Compatibility",
      installed: true,
      enabled: true,
      iconColor: "text-teal-400 bg-teal-500/10 border-teal-500/30",
    },
    {
      id: "worldedit",
      name: "WorldEdit",
      version: "7.2.15",
      author: "EngineHub",
      description: "In-game map editing, terraforming, brush tools, and schematic loading.",
      category: "World Building",
      installed: false,
      enabled: false,
      iconColor: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    },
    {
      id: "coreprotect",
      name: "CoreProtect",
      version: "22.2",
      author: "Intelli",
      description: "Fast block logging, anti-griefing, rollbacks, and chest transaction inspections.",
      category: "Security",
      installed: false,
      enabled: false,
      iconColor: "text-sky-400 bg-sky-500/10 border-sky-500/30",
    },
  ]);

  // Players State
  const [playersList, setPlayersList] = useState<OnlinePlayer[]>([
    {
      uuid: "00000000-0000-0000-0009-01f81014e304",
      username: "ServerAdmin",
      ping: 8,
      gamemode: "creative",
      dimension: "overworld",
      isOp: true,
      isCracked: false,
      ip: "127.0.0.1",
    },
    {
      uuid: "e839121a-49bf-33b0-91bc-318029ab0f9a",
      username: "ShadowCrafter_99",
      ping: 28,
      gamemode: "survival",
      dimension: "overworld",
      isOp: false,
      isCracked: true,
      ip: "192.168.1.104",
    },
    {
      uuid: "f1a23456-7890-4abc-def1-234567890abc",
      username: "Alex_Miner",
      ping: 34,
      gamemode: "survival",
      dimension: "nether",
      isOp: false,
      isCracked: true,
      ip: "10.0.0.45",
    },
    {
      uuid: "a9988776-5544-3322-1100-aabbccddeeff",
      username: "EnderDragonSlayer",
      ping: 42,
      gamemode: "survival",
      dimension: "the_end",
      isOp: false,
      isCracked: false,
      ip: "172.16.0.22",
    },
  ]);

  // Server Properties Config state
  const [configValues, setConfigValues] = useState({
    onlineMode: false,
    enforceSecureProfile: false,
    pvp: true,
    allowFlight: false,
    difficulty: "hard",
    gamemode: "survival",
    maxPlayers: 20,
    viewDistance: 8,
    simDistance: 6,
    spawnProtection: 0,
    motd: "PeerCraft - Asymmetric Dynamic Cluster [Cracked OK]",
    minRamGb: 4,
    maxRamGb: 8,
    aikarFlags: true,
  });

  // Backups State
  const [backups, setBackups] = useState([
    {
      id: "b-1",
      name: "world_snapshot_auto_1400.tar.gz",
      size: "412.5 MB",
      date: "Today at 14:00",
      status: "COMPLETED",
      target: "Cloudflare R2 + Local",
    },
    {
      id: "b-2",
      name: "world_pre_cluster_handoff.tar.gz",
      size: "398.2 MB",
      date: "Yesterday at 22:45",
      status: "COMPLETED",
      target: "Local Storage",
    },
  ]);

  // Bootstrap State
  const [bootstrapStatus, setBootstrapStatus] = useState({
    javaInstalled: true,
    javaVersion: "OpenJDK 21.0.2 (Headless Portable)",
    paperJarReady: true,
    paperVersion: "PaperMC 1.20.4 Build #498",
    velocityJarReady: true,
    velocityVersion: "Velocity 3.3.0 Snapshot",
    isBootstrapping: false,
  });

  // Auto-scroll console
  useEffect(() => {
    consoleBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleLogs]);

  // Telemetry ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds((s) => s + 1);
      // Small jitter for realistic live feeling
      setCpuUsage(Number((22 + Math.random() * 6).toFixed(1)));
      setMemoryUsedMb(Math.floor(3400 + Math.random() * 120));
      setNetRxKbps(Math.floor(750 + Math.random() * 180));
      setNetTxKbps(Math.floor(3000 + Math.random() * 400));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

  const handleSendCommand = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim();
    const time = new Date().toLocaleTimeString();

    // Add command to log
    const cmdLog = {
      id: Date.now().toString(),
      time,
      source: "ADMIN",
      level: "EXEC",
      text: `> ${cmd}`,
    };

    // Simulate response based on command
    let replyText = `Dispatched command: ${cmd}`;
    if (cmd.startsWith("/op ")) {
      const target = cmd.replace("/op ", "");
      replyText = `Made ${target} a server operator`;
    } else if (cmd.startsWith("/deop ")) {
      const target = cmd.replace("/deop ", "");
      replyText = `Made ${target} no longer a server operator`;
    } else if (cmd.startsWith("/gamemode ")) {
      replyText = `Set game mode to ${cmd.split(" ")[1] || "survival"}`;
    } else if (cmd.startsWith("/tps")) {
      replyText = "TPS from last 1m, 5m, 15m: 20.0, 20.0, 20.0 (MSPT: 12.4ms)";
    } else if (cmd.startsWith("/save-all")) {
      replyText = "Saved the game. Chunks flushed to disk & R2 sync triggered.";
    } else if (cmd.startsWith("/say ")) {
      replyText = `[Server] ${cmd.replace("/say ", "")}`;
    } else if (cmd.startsWith("/kick ")) {
      replyText = "Kicked player from the server.";
    } else if (cmd.startsWith("/whitelist add ")) {
      replyText = "Added player to whitelist.";
    }

    const replyLog = {
      id: (Date.now() + 1).toString(),
      time,
      source: "Paper",
      level: "INFO",
      text: replyText,
    };

    setConsoleLogs((prev) => [...prev, cmdLog, replyLog]);
    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    setCommandInput("");
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIdx);
        setCommandInput(commandHistory[nextIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIdx = historyIndex + 1;
        if (nextIdx >= commandHistory.length) {
          setHistoryIndex(-1);
          setCommandInput("");
        } else {
          setHistoryIndex(nextIdx);
          setCommandInput(commandHistory[nextIdx]);
        }
      }
    }
  };

  const handlePowerAction = (action: "start" | "restart" | "stop" | "kill") => {
    const time = new Date().toLocaleTimeString();
    if (action === "start") {
      setServerState("STARTING");
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          time,
          source: "Pterodactyl",
          level: "INFO",
          text: "Starting server container and invoking java runtime...",
        },
      ]);
      setTimeout(() => {
        setServerState("RUNNING");
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            time: new Date().toLocaleTimeString(),
            source: "Paper",
            level: "INFO",
            text: "PaperMC instance active on port 25565. Online-mode=false.",
          },
        ]);
      }, 2000);
    } else if (action === "restart") {
      setServerState("STOPPING");
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          time,
          source: "Pterodactyl",
          level: "WARN",
          text: "Graceful restart requested. Dispatching /save-all and stopping...",
        },
      ]);
      setTimeout(() => {
        setServerState("STARTING");
        setTimeout(() => {
          setServerState("RUNNING");
          setConsoleLogs((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              time: new Date().toLocaleTimeString(),
              source: "Paper",
              level: "INFO",
              text: "PaperMC server reboot complete (20.0 TPS).",
            },
          ]);
        }, 1500);
      }, 1500);
    } else if (action === "stop") {
      setServerState("STOPPING");
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          time,
          source: "Pterodactyl",
          level: "WARN",
          text: "Dispatched stop command to server daemon.",
        },
      ]);
      setTimeout(() => {
        setServerState("OFFLINE");
      }, 2000);
    } else if (action === "kill") {
      setServerState("OFFLINE");
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          time,
          source: "Pterodactyl",
          level: "ERROR",
          text: "SIGKILL dispatched! Server process terminated forcefully.",
        },
      ]);
    }
  };

  const handleSelectFile = (file: ServerFile) => {
    if (file.type === "file") {
      setSelectedFile(file);
      setEditorContent(file.content || "");
    }
  };

  const handleSaveFile = () => {
    if (!selectedFile) return;
    setFilesList((prev) =>
      prev.map((f) => (f.path === selectedFile.path ? { ...f, content: editorContent } : f))
    );
    setFileSaveToast(true);
    setTimeout(() => setFileSaveToast(false), 2200);

    if (selectedFile.name === "server.properties" && editorContent.includes("online-mode=false")) {
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          time: new Date().toLocaleTimeString(),
          source: "Config",
          level: "INFO",
          text: `Saved ${selectedFile.name}: Cracked/Offline mode active (online-mode=false).`,
        },
      ]);
    }
  };

  const togglePlugin = (id: string) => {
    setPluginsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const installPlugin = (id: string) => {
    setPluginsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, installed: true, enabled: true } : p))
    );
    const p = pluginsList.find((x) => x.id === id);
    setConsoleLogs((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString(),
        source: "PluginManager",
        level: "INFO",
        text: `Downloaded and loaded plugin '${p?.name}' into /plugins/ directory.`,
      },
    ]);
  };

  const handleKickPlayer = (username: string) => {
    setPlayersList((prev) => prev.filter((p) => p.username !== username));
    setConsoleLogs((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString(),
        source: "Paper",
        level: "INFO",
        text: `Kicked player '${username}' by Admin.`,
      },
    ]);
  };

  const handleToggleOp = (username: string) => {
    setPlayersList((prev) =>
      prev.map((p) => (p.username === username ? { ...p, isOp: !p.isOp } : p))
    );
    const p = playersList.find((x) => x.username === username);
    setConsoleLogs((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString(),
        source: "Paper",
        level: "INFO",
        text: p?.isOp
          ? `Made ${username} no longer a server operator.`
          : `Made ${username} a server operator.`,
      },
    ]);
  };

  const handleCreateBackup = () => {
    const newBackup = {
      id: `b-${Date.now()}`,
      name: `world_manual_${new Date().toISOString().slice(0, 10)}.tar.gz`,
      size: `${(400 + Math.random() * 40).toFixed(1)} MB`,
      date: "Just now",
      status: "COMPLETED",
      target: "Cloudflare R2 + Local",
    };
    setBackups((prev) => [newBackup, ...prev]);
    setConsoleLogs((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString(),
        source: "R2_Backup",
        level: "INFO",
        text: `World snapshot '${newBackup.name}' created and synchronized.`,
      },
    ]);
  };

  const handleRunBootstrap = () => {
    setBootstrapStatus((prev) => ({ ...prev, isBootstrapping: true }));
    setTimeout(() => {
      setBootstrapStatus({
        javaInstalled: true,
        javaVersion: "OpenJDK 21.0.2 (Headless Portable)",
        paperJarReady: true,
        paperVersion: "PaperMC 1.20.4 Build #498",
        velocityJarReady: true,
        velocityVersion: "Velocity 3.3.0 Snapshot",
        isBootstrapping: false,
      });
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          time: new Date().toLocaleTimeString(),
          source: "Bootstrap",
          level: "INFO",
          text: "Portable OpenJDK 21, PaperMC jar, and Velocity jar verified in client bin/ folder. Ready to launch.",
        },
      ]);
    }, 2000);
  };

  const quickCommands = [
    { label: "/tps", cmd: "/tps" },
    { label: "/save-all", cmd: "/save-all flush" },
    { label: "Day", cmd: "/time set day" },
    { label: "Clear Weather", cmd: "/weather clear" },
    { label: "Creative", cmd: "/gamemode creative ServerAdmin" },
    { label: "Survival", cmd: "/gamemode survival ServerAdmin" },
    { label: "Reload", cmd: "/reload confirm" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] text-slate-100 font-sans overflow-hidden">
      {/* Pterodactyl Top Status Header */}
      <header className="px-6 py-4 bg-slate-900/90 border-b border-slate-800/90 backdrop-blur-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Server & Node Identity */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Server className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black tracking-tight text-white">
                PaperMC Pterodactyl Panel
              </h2>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30 uppercase tracking-wide">
                Admin Console
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Cracked / TLauncher Enabled
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span>
                Node: <strong className="text-slate-200">Localhost (Overworld)</strong>
              </span>
              <span>•</span>
              <span className="font-mono text-cyan-300 font-bold">127.0.0.1:25565</span>
              <span>•</span>
              <span className="font-mono text-indigo-300">mc.peercraft.live:25577</span>
            </div>
          </div>
        </div>

        {/* Server Power Controls & Instance Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Target Instance Picker */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 text-xs">
            {(["overworld", "nether_end", "velocity"] as const).map((inst) => (
              <button
                key={inst}
                onClick={() => setSelectedInstance(inst)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedInstance === inst
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {inst === "overworld"
                  ? "Overworld (25565)"
                  : inst === "nether_end"
                  ? "Nether/End (25566)"
                  : "Velocity (25577)"}
              </button>
            ))}
          </div>

          {/* Power State Status Pill */}
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              serverState === "RUNNING"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : serverState === "STARTING"
                ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                : serverState === "STOPPING"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                serverState === "RUNNING"
                  ? "bg-emerald-400 animate-pulse"
                  : serverState === "STARTING"
                  ? "bg-blue-400 animate-ping"
                  : serverState === "STOPPING"
                  ? "bg-amber-400"
                  : "bg-rose-400"
              }`}
            />
            {serverState}
          </div>

          {/* Pterodactyl Power Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-950/90 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => handlePowerAction("start")}
              disabled={serverState === "RUNNING" || serverState === "STARTING"}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
              title="Start Server"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start
            </button>
            <button
              onClick={() => handlePowerAction("restart")}
              disabled={serverState === "OFFLINE"}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-600/20"
              title="Restart Server"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Restart
            </button>
            <button
              onClick={() => handlePowerAction("stop")}
              disabled={serverState === "OFFLINE" || serverState === "STOPPING"}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/20"
              title="Graceful Stop"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              Stop
            </button>
            <button
              onClick={() => handlePowerAction("kill")}
              disabled={serverState === "OFFLINE"}
              className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-950/80 hover:text-rose-200 transition-all"
              title="Force Kill (SIGKILL)"
            >
              <Skull className="w-4 h-4" />
            </button>
          </div>

          {/* Return to Client View Button */}
          {onBackToClient && (
            <button
              onClick={onBackToClient}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5"
            >
              Player View
            </button>
          )}
        </div>
      </header>

      {/* Real-time Telemetry Stats Bar (Pterodactyl Gauges) */}
      <div className="px-6 py-3 bg-slate-950/70 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
        {/* CPU */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-400 font-medium text-[11px]">CPU Usage</div>
            <div className="font-mono font-bold text-white flex items-center gap-1">
              <span>{serverState === "RUNNING" ? `${cpuUsage}%` : "0.0%"}</span>
              <span className="text-[10px] text-slate-500">(16 Threads)</span>
            </div>
          </div>
        </div>

        {/* Memory */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-400 font-medium text-[11px]">Memory</div>
            <div className="font-mono font-bold text-white">
              {serverState === "RUNNING"
                ? `${(memoryUsedMb / 1024).toFixed(2)} GB / ${(memoryLimitMb / 1024).toFixed(0)} GB`
                : "0.00 GB"}
            </div>
          </div>
        </div>

        {/* Disk */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-400 font-medium text-[11px]">Disk Space</div>
            <div className="font-mono font-bold text-white">
              {diskUsedGb.toFixed(2)} GB / {diskLimitGb.toFixed(0)} GB
            </div>
          </div>
        </div>

        {/* Network I/O */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-400 font-medium text-[11px]">Network I/O</div>
            <div className="font-mono font-bold text-slate-200">
              ▲ {(netTxKbps / 1024).toFixed(1)}M | ▼ {(netRxKbps / 1024).toFixed(1)}M
            </div>
          </div>
        </div>

        {/* Uptime */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-400 font-medium text-[11px]">Uptime</div>
            <div className="font-mono font-bold text-white">
              {serverState === "RUNNING" ? formatUptime(uptimeSeconds) : "Offline"}
            </div>
          </div>
        </div>

        {/* Online-Mode / Cracked status */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-400 font-medium text-[11px]">Online-Mode</div>
            <div className="font-mono font-bold text-amber-400 flex items-center gap-1">
              <span>FALSE</span>
              <span className="text-[10px] text-emerald-400 font-semibold">(Cracked OK)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="px-6 bg-slate-900 border-b border-slate-800 flex items-center gap-1 overflow-x-auto">
        {[
          { id: "console" as const, label: "Console", icon: Terminal },
          { id: "files" as const, label: "File Manager", icon: Folder },
          { id: "plugins" as const, label: "Paper Plugins", icon: Boxes },
          { id: "players" as const, label: "Player Manager", icon: Users },
          { id: "config" as const, label: "Server Config", icon: Sliders },
          { id: "backups" as const, label: "Backups & R2", icon: HardDrive },
          { id: "bootstrap" as const, label: "1-Click Client Setup", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-400 bg-blue-500/5"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* TAB 1: CONSOLE */}
        {activeTab === "console" && (
          <div className="flex flex-col h-full space-y-4">
            {/* Terminal Window */}
            <div className="flex-1 bg-[#070a10] border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl min-h-[380px]">
              {/* Terminal Title Bar */}
              <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 ml-2">
                    peercraft-daemon@papermc-node: ~
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const text = consoleLogs
                        .map((l) => `[${l.time}] [${l.source}/${l.level}] ${l.text}`)
                        .join("\n");
                      navigator.clipboard.writeText(text);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 text-xs flex items-center gap-1"
                    title="Copy Logs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setConsoleLogs([])}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 text-xs"
                    title="Clear Terminal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Terminal Logs Feed */}
              <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1 bg-[#06080e]">
                {consoleLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 leading-relaxed break-all">
                    <span className="text-slate-600 select-none">[{log.time}]</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase select-none ${
                        log.level === "ERROR"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : log.level === "WARN"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : log.level === "EXEC"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {log.source}/{log.level}
                    </span>
                    <span
                      className={
                        log.level === "ERROR"
                          ? "text-rose-400 font-semibold"
                          : log.level === "WARN"
                          ? "text-amber-300 font-medium"
                          : log.level === "EXEC"
                          ? "text-cyan-300 font-bold"
                          : "text-slate-200"
                      }
                    >
                      {log.text}
                    </span>
                  </div>
                ))}
                <div ref={consoleBottomRef} />
              </div>

              {/* Command Input Bar */}
              <form
                onSubmit={handleSendCommand}
                className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
              >
                <span className="text-cyan-400 font-mono font-bold select-none pl-2">&gt;</span>
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyDown={handleKeyDownInput}
                  placeholder="Type a Minecraft / Paper command (e.g. /op, /gamemode, /whitelist, /tps, /say)..."
                  className="flex-1 bg-transparent border-0 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:ring-0"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </form>
            </div>

            {/* Quick Command Chips */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                Quick Commands:
              </span>
              {quickCommands.map((qc) => (
                <button
                  key={qc.label}
                  onClick={() => {
                    setCommandInput(qc.cmd);
                  }}
                  className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-xs transition-all"
                >
                  {qc.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: FILE MANAGER */}
        {activeTab === "files" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-270px)] min-h-[460px]">
            {/* File List Tree */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Server Directory</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500">/servers/overworld</span>
              </div>

              <div className="flex-1 overflow-y-auto mt-3 space-y-1">
                {filesList.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => handleSelectFile(file)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                      selectedFile?.path === file.path
                        ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                        : "text-slate-300 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {file.type === "dir" ? (
                        <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <FileCode className="w-4 h-4 text-blue-400 shrink-0" />
                      )}
                      <span className="font-mono truncate">{file.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">{file.size}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* In-Panel File Editor */}
            <div className="lg:col-span-2 bg-[#070a10] border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
              {/* Editor Header */}
              <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-xs font-bold text-white">
                    {selectedFile?.path || "No file selected"}
                  </span>
                  {selectedFile?.name === "server.properties" && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                      online-mode=false
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {fileSaveToast && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-fadeIn">
                      <Check className="w-3.5 h-3.5" /> Saved!
                    </span>
                  )}
                  <button
                    onClick={handleSaveFile}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save File
                  </button>
                </div>
              </div>

              {/* Editor Code Area */}
              <div className="flex-1 p-4 bg-[#06080e] overflow-hidden flex flex-col">
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="flex-1 w-full h-full bg-transparent text-slate-100 font-mono text-xs leading-relaxed resize-none focus:outline-none border-0 selection:bg-blue-600/40"
                  spellCheck={false}
                />
              </div>

              {/* Editor Footer */}
              <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between font-mono">
                <span>Lines: {editorContent.split("\n").length}</span>
                <span>Encoding: UTF-8 | Config Format</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PLUGINS MARKETPLACE */}
        {activeTab === "plugins" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">PaperMC Plugin Suite</h3>
                <p className="text-xs text-slate-400">
                  Manage installed plugins and 1-click install plugins tailored for cracked / offline mode & cluster sharding.
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-bold">
                {pluginsList.filter((p) => p.installed && p.enabled).length} Active Plugins
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pluginsList.map((plugin) => (
                <div
                  key={plugin.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    plugin.installed
                      ? "bg-slate-900/90 border-slate-700/80 shadow-lg shadow-black/40"
                      : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-sm ${plugin.iconColor}`}
                        >
                          <Boxes className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-white text-sm">{plugin.name}</h4>
                            <span className="text-[10px] font-mono text-slate-400">v{plugin.version}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">
                            By {plugin.author}
                          </span>
                        </div>
                      </div>

                      {plugin.recommendedForCracked && (
                        <span className="px-2 py-0.5 text-[9px] font-extrabold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                          Cracked Fix
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-4">{plugin.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      {plugin.category}
                    </span>

                    {plugin.installed ? (
                      <button
                        onClick={() => togglePlugin(plugin.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          plugin.enabled
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
                        }`}
                      >
                        {plugin.enabled ? "Active" : "Disabled"}
                      </button>
                    ) : (
                      <button
                        onClick={() => installPlugin(plugin.id)}
                        className="px-3.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        1-Click Install
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PLAYER MANAGEMENT */}
        {activeTab === "players" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Live Player Management</h3>
                <p className="text-xs text-slate-400">
                  Manage connected players across Overworld and Nether/End shards (both Cracked and Premium accounts).
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-bold">
                {playersList.length} Connected Players
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Player</th>
                    <th className="px-4 py-3.5">Account Type</th>
                    <th className="px-4 py-3.5">Shard Dimension</th>
                    <th className="px-4 py-3.5">Ping</th>
                    <th className="px-4 py-3.5">Gamemode</th>
                    <th className="px-5 py-3.5 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {playersList.map((player) => (
                    <tr key={player.uuid} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                          {player.username.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {player.username}
                            {player.isOp && (
                              <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                                OP
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">{player.uuid}</div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        {player.isCracked ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Cracked (Offline UUID)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            Mojang Auth
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            player.dimension === "overworld"
                              ? "bg-blue-500/15 text-blue-300 border border-blue-500/20"
                              : player.dimension === "nether"
                              ? "bg-rose-500/15 text-rose-300 border border-rose-500/20"
                              : "bg-purple-500/15 text-purple-300 border border-purple-500/20"
                          }`}
                        >
                          {player.dimension}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-emerald-400 font-semibold">
                        {player.ping} ms
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-300 uppercase text-[11px]">
                        {player.gamemode}
                      </td>

                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleToggleOp(player.username)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            player.isOp
                              ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                          }`}
                        >
                          {player.isOp ? "De-OP" : "Make OP"}
                        </button>
                        <button
                          onClick={() => handleKickPlayer(player.username)}
                          className="px-2.5 py-1 rounded-lg bg-rose-900/40 hover:bg-rose-800/80 text-rose-200 border border-rose-700/50 text-[11px] font-bold transition-all"
                        >
                          Kick
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SERVER CONFIGURATION & STARTUP */}
        {activeTab === "config" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Game Rules & server.properties GUI */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Gameplay & Security Settings</h3>
              </div>

              {/* Online Mode Notice */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-300">Cracked Mode Active (Online-Mode: FALSE)</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    Online verification is disabled across Velocity and PaperMC instances so that players using TLauncher and offline launchers can join without Mojang account errors.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                  <div>
                    <span className="font-semibold text-white">Server Online Mode</span>
                    <p className="text-[11px] text-slate-500">Allow cracked/TLauncher players</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    FALSE (Cracked OK)
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                  <div>
                    <span className="font-semibold text-white">Player vs Player (PvP)</span>
                    <p className="text-[11px] text-slate-500">Enable combat damage between players</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={configValues.pvp}
                    onChange={(e) => setConfigValues({ ...configValues, pvp: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                  <div>
                    <span className="font-semibold text-white">View Distance</span>
                    <p className="text-[11px] text-slate-500">Chunk render distance (default 8)</p>
                  </div>
                  <span className="font-mono text-cyan-300 font-bold">{configValues.viewDistance} Chunks</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                  <div>
                    <span className="font-semibold text-white">Difficulty</span>
                    <p className="text-[11px] text-slate-500">World hostility level</p>
                  </div>
                  <select
                    value={configValues.difficulty}
                    onChange={(e) => setConfigValues({ ...configValues, difficulty: e.target.value })}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono text-xs"
                  >
                    <option value="peaceful">Peaceful</option>
                    <option value="easy">Easy</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="py-2">
                  <label className="block font-semibold text-white mb-1">Server MOTD (Message of the Day)</label>
                  <input
                    type="text"
                    value={configValues.motd}
                    onChange={(e) => setConfigValues({ ...configValues, motd: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>

            {/* JVM & Startup Memory Allocation */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Cpu className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Java VM & Startup Flags</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-white mb-1">
                    Heap Allocation (Min -Xms / Max -Xmx)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-500">Min Allocation (-Xms)</span>
                      <div className="font-mono text-sm font-bold text-cyan-400">4 GB</div>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-500">Max Allocation (-Xmx)</span>
                      <div className="font-mono text-sm font-bold text-purple-400">8 GB</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Aikar's Optimized G1GC Flags</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                    -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+AlwaysPreTouch -XX:SurvivorRatio=32
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="font-bold text-white">Active Java Executable Path</span>
                  <div className="font-mono text-[11px] text-slate-400 break-all">
                    %APPDATA%/PeerCraft/bin/jre21/bin/java.exe
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    ✓ Self-contained portable headless OpenJDK 21
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: BACKUPS & CLOUDFLARE R2 */}
        {activeTab === "backups" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">World Backups & Cloud Snapshots</h3>
                <p className="text-xs text-slate-400">
                  Instantaneous snapshots synced to Cloudflare R2 object storage for cluster failover.
                </p>
              </div>
              <button
                onClick={handleCreateBackup}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/25 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Create Instant Backup
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {backups.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm font-mono">{b.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{b.size}</span>
                        <span>•</span>
                        <span>{b.date}</span>
                        <span>•</span>
                        <span className="text-cyan-300 font-medium">{b.target}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`Restoring ${b.name}...`)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: 1-CLICK CLIENT SETUP & PACKAGING */}
        {activeTab === "bootstrap" && (
          <div className="max-w-3xl space-y-6">
            <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Single Executable (.EXE) Client Architecture</h3>
                  <p className="text-xs text-slate-400">Zero manual installations required for your players</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-300 text-sm">How Player Distribution Works:</h4>
                    <p className="text-slate-300 mt-1 leading-relaxed">
                      When you distribute <strong className="text-white font-mono">PeerCraft.exe</strong>, regular players simply double-click it. They do <strong>NOT</strong> need to install Java, Node.js, or any background dependencies. The Tauri native client handles all cluster routing, domain resolution, and network connections automatically.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-slate-800/80">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-cyan-300 text-sm">Self-Contained Server Hosting:</h4>
                    <p className="text-slate-300 mt-1 leading-relaxed">
                      If an admin hosts a server shard, the app automatically downloads portable OpenJDK 21 and the PaperMC JAR into the local app folder seamlessly in the background without modifying system PATH or system files.
                    </p>
                  </div>
                </div>
              </div>

              {/* Binary Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-500 font-medium text-[11px]">Java Runtime (JRE)</div>
                  <div className="font-bold text-white">{bootstrapStatus.javaVersion}</div>
                  <span className="text-emerald-400 font-semibold text-[10px]">✓ Embedded & Ready</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-500 font-medium text-[11px]">PaperMC Core</div>
                  <div className="font-bold text-white">{bootstrapStatus.paperVersion}</div>
                  <span className="text-emerald-400 font-semibold text-[10px]">✓ Verified</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-500 font-medium text-[11px]">Velocity Proxy</div>
                  <div className="font-bold text-white">{bootstrapStatus.velocityVersion}</div>
                  <span className="text-emerald-400 font-semibold text-[10px]">✓ Offline Secret Configured</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleRunBootstrap}
                  disabled={bootstrapStatus.isBootstrapping}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${bootstrapStatus.isBootstrapping ? "animate-spin" : ""}`} />
                  {bootstrapStatus.isBootstrapping ? "Verifying & Syncing Binaries..." : "Verify & Refresh Embedded Binaries"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
