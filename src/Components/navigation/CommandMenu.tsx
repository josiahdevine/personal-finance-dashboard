import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut
} from "../ui/command";

// Import icons - keeping only those actually used
import {
  Calculator,
  CreditCard,
  Settings,
  Smile,
  User,
  LayoutDashboard,
  LogOut,
  HelpCircle,
  Bell,
  Search,
  Wallet,
  PieChart,
  Home,
  Building
} from "lucide-react";

interface CommandItemType {
  id: string;
  name: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action?: () => void;
  url?: string;
  keywords?: string[];
}

interface CommandGroupType {
  heading: string;
  items: CommandItemType[];
}

interface CommandMenuProps {
  extraGroups?: CommandGroupType[];
  onClose?: () => void;
  defaultOpen?: boolean;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({
  extraGroups = [],
  onClose,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const navigate = useNavigate();
  const { isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (item: CommandItemType) => {
    if (item.url) {
      navigate(item.url);
    } else if (item.action) {
      item.action();
    }
    setOpen(false);
    onClose?.();
  };

  // Common navigation commands
  const commonNavigation: CommandGroupType = {
    heading: "Navigation",
    items: [
      {
        id: "home",
        name: "Home",
        icon: <Home className="h-4 w-4" />,
        url: "/",
        keywords: ["home", "landing", "main"],
      },
      {
        id: "features",
        name: "Features",
        icon: <Smile className="h-4 w-4" />,
        url: "/features",
        keywords: ["features", "benefits"],
      },
      {
        id: "pricing",
        name: "Pricing",
        icon: <CreditCard className="h-4 w-4" />,
        url: "/pricing",
        keywords: ["pricing", "plans"],
      },
      {
        id: "help",
        name: "Help & Support",
        icon: <HelpCircle className="h-4 w-4" />,
        url: "/help",
        keywords: ["help", "support"],
        shortcut: "?",
      },
    ],
  };

  // Dashboard commands
  const dashboardGroup: CommandGroupType = {
    heading: "Dashboard",
    items: [
      {
        id: "dashboard",
        name: "Dashboard",
        icon: <LayoutDashboard className="h-4 w-4" />,
        url: "/dashboard",
        keywords: ["dashboard", "overview"],
        shortcut: "D",
      },
      {
        id: "transactions",
        name: "Transactions",
        icon: <Wallet className="h-4 w-4" />,
        url: "/dashboard/transactions",
        keywords: ["transactions", "payments"],
        shortcut: "T",
      },
      {
        id: "analytics",
        name: "Analytics",
        icon: <PieChart className="h-4 w-4" />,
        url: "/dashboard/analytics",
        keywords: ["analytics", "charts"],
        shortcut: "A",
      },
      {
        id: "bills",
        name: "Bills & Expenses",
        icon: <Calculator className="h-4 w-4" />,
        url: "/dashboard/bills",
        keywords: ["bills", "expenses"],
        shortcut: "B",
      },
      {
        id: "accounts",
        name: "Bank Accounts",
        icon: <Building className="h-4 w-4" />,
        url: "/dashboard/accounts",
        keywords: ["accounts", "banking"],
      },
      {
        id: "notifications",
        name: "Notifications",
        icon: <Bell className="h-4 w-4" />,
        url: "/dashboard/notifications",
        keywords: ["notifications", "alerts"],
      },
    ],
  };

  // Account commands
  const accountGroup: CommandGroupType = {
    heading: "Account",
    items: [
      {
        id: "profile",
        name: "Profile",
        icon: <User className="h-4 w-4" />,
        url: "/profile",
        keywords: ["profile", "account"],
        shortcut: "P",
      },
      {
        id: "settings",
        name: "Settings",
        icon: <Settings className="h-4 w-4" />,
        url: "/settings",
        keywords: ["settings", "preferences"],
        shortcut: "S",
      },
      {
        id: "logout",
        name: "Log out",
        icon: <LogOut className="h-4 w-4" />,
        action: () => signOut(),
        keywords: ["logout", "sign out"],
        shortcut: "L",
      },
    ],
  };

  // Search commands
  const searchGroup: CommandGroupType = {
    heading: "Search",
    items: [
      {
        id: "search-transactions",
        name: "Search transactions...",
        icon: <Search className="h-4 w-4" />,
        url: "/dashboard/transactions?search=true",
        keywords: ["search", "find", "transactions"],
      },
      {
        id: "search-bills",
        name: "Search bills...",
        icon: <Search className="h-4 w-4" />,
        url: "/dashboard/bills?search=true",
        keywords: ["search", "find", "bills"],
      },
    ],
  };

  const groups = isAuthenticated
    ? [commonNavigation, dashboardGroup, accountGroup, searchGroup, ...extraGroups]
    : [commonNavigation, ...extraGroups];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {groups.map((group) => (
          <React.Fragment key={group.heading}>
            <CommandGroup heading={group.heading}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item)}
                >
                  <div className="flex items-center">
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </div>
                  {item.shortcut && (
                    <CommandShortcut>{item.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
}; 