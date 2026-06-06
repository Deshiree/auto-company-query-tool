"""
全国车企数据采集工具集 - 主控脚本
==========================================
功能：统一调度财报采集、招聘采集、企业信息采集
用法：python main.py [命令] [选项]
"""

import os
import sys
import argparse
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# 项目目录（支持 GitHub Actions 环境变量）
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# GITHUB_WORKSPACE 是 GitHub Actions 的默认工作目录
GITHUB_WORKSPACE = os.environ.get("GITHUB_WORKSPACE", os.path.join(BASE_DIR, ".."))
DATA_DIR = os.environ.get("DATA_DIR", os.path.join(GITHUB_WORKSPACE, "data"))


def cmd_financial(args):
    """采集财务数据"""
    logger.info("=" * 50)
    logger.info("  启动财务数据采集")
    logger.info("=" * 50)

    from financial_collector import AKShareCollector, TushareCollector, BaoStockCollector, STOCK_LIST

    output_dir = os.path.join(DATA_DIR, "financial")
    year = args.year

    # 选择数据源
    if args.source == "akshare":
        collector = AKShareCollector(output_dir=output_dir)
    elif args.source == "tushare":
        # Token 优先级：命令行参数 > 环境变量
        token = args.token or os.environ.get("TUSHARE_TOKEN", "")
        if not token:
            print("❌ 使用 Tushare 需要提供 Token，请通过 --token 参数指定或设置 TUSHARE_TOKEN 环境变量")
            print("   注册地址: https://tushare.pro")
            return
        collector = TushareCollector(token=token, output_dir=output_dir)
    elif args.source == "baostock":
        collector = BaoStockCollector(output_dir=output_dir)
    else:
        print(f"❌ 不支持的数据源: {args.source}")
        return

    # 单企 or 批量
    if args.company:
        # 从STOCK_LIST查找股票代码
        code = STOCK_LIST.get(args.company)
        if not code:
            print(f"❌ 未找到 {args.company} 的股票代码，请检查企业名称")
            print(f"   支持的企业: {', '.join(list(STOCK_LIST.keys())[:10])}...")
            return
        collector.collect_all(code, args.company, year)
    else:
        collector.batch_collect(year)

    print(f"\n✅ 财务数据采集完成！数据保存在 {output_dir}")


def cmd_recruitment(args):
    """采集招聘数据"""
    logger.info("=" * 50)
    logger.info("  启动招聘数据采集")
    logger.info("=" * 50)

    from recruitment_collector import (
        ZhiyeCollector, GenericWebCollector, BossZhipinCollector,
        COMPANY_RECRUITMENT_SITES,
    )

    output_dir = os.path.join(DATA_DIR, "recruitment")

    if args.platform == "official":
        # 采集车企官方招聘站
        collector = ZhiyeCollector(output_dir=output_dir)

        if args.company:
            config = COMPANY_RECRUITMENT_SITES.get(args.company)
            if not config:
                print(f"❌ 未找到 {args.company} 的招聘站配置")
                print(f"   支持的企业: {', '.join(COMPANY_RECRUITMENT_SITES.keys())}")
                return
            collector.collect_company(args.company, config)
        else:
            for name, config in COMPANY_RECRUITMENT_SITES.items():
                try:
                    collector.collect_company(name, config)
                except Exception as e:
                    logger.error(f"{name} 采集失败: {e}")

        collector.save_results(args.company)

    elif args.platform == "boss":
        if not args.cookie:
            print("❌ 使用 BOSS直聘 采集需要登录Cookie")
            print("   步骤：1. 登录 zhipin.com → 2. 复制Cookie → 3. 通过 --cookie 参数传入")
            return
        collector = BossZhipinCollector(cookie=args.cookie, output_dir=output_dir)

        if args.company:
            collector.search_company_jobs(args.company)
        else:
            # 从车企清单批量搜索
            for name in COMPANY_RECRUITMENT_SITES.keys():
                try:
                    collector.search_company_jobs(name)
                except Exception as e:
                    logger.error(f"BOSS直聘 {name} 搜索失败: {e}")

        collector.save_results(args.company)

    elif args.platform == "generic":
        if not args.url:
            print("❌ 通用采集需要指定URL，请通过 --url 参数传入")
            return
        collector = GenericWebCollector(output_dir=output_dir)
        company = args.company or "未知企业"
        collector.collect_company(company, args.url)
        collector.save_results(company)

    print(f"\n✅ 招聘数据采集完成！数据保存在 {output_dir}")


def cmd_enterprise(args):
    """采集企业工商信息（天眼查API）"""
    logger.info("=" * 50)
    logger.info("  启动企业工商信息采集")
    logger.info("=" * 50)

    from recruitment_collector import TianyanchaCollector

    if not args.token:
        print("❌ 使用天眼查API需要Token")
        print("   注册地址: https://open.tianyancha.com")
        return

    output_dir = os.path.join(DATA_DIR, "enterprise")
    collector = TianyanchaCollector(token=args.token, output_dir=output_dir)

    if args.company_id:
        # 按天眼查企业ID采集
        collector.collect_company_full(args.company or "未知企业", args.company_id)
    elif args.industry:
        # 按行业代码搜索
        result = collector.search_by_industry(industry_code=args.industry)
        if result:
            print(f"✅ 搜索完成，结果已保存")
    else:
        print("❌ 请指定 --company-id 或 --industry 参数")

    print(f"\n✅ 企业信息采集完成！数据保存在 {output_dir}")


def cmd_status(args):
    """查看采集状态"""
    print("=" * 50)
    print("  采集状态概览")
    print("=" * 50)

    for subdir in ["financial", "recruitment", "enterprise"]:
        path = os.path.join(DATA_DIR, subdir)
        if os.path.exists(path):
            files = os.listdir(path)
            print(f"\n📁 {subdir}/: {len(files)} 个文件")
            for f in files[:5]:
                size = os.path.getsize(os.path.join(path, f))
                print(f"   - {f} ({size/1024:.1f} KB)")
            if len(files) > 5:
                print(f"   ... 还有 {len(files)-5} 个文件")
        else:
            print(f"\n📁 {subdir}/: 尚未采集")


def main():
    parser = argparse.ArgumentParser(
        description="全国车企数据采集工具集",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用示例:
  # 采集2025年全部上市车企财务数据（AKShare免费）
  python main.py financial --year 2025 --source akshare

  # 采集单家车企财务数据
  python main.py financial --year 2025 --source akshare --company 比亚迪

  # 采集全部车企官方招聘站
  python main.py recruitment --platform official

  # 采集单家车企官方招聘站
  python main.py recruitment --platform official --company 比亚迪

  # BOSS直聘搜索（需Cookie）
  python main.py recruitment --platform boss --cookie "your_cookie" --company 比亚迪

  # 天眼查企业信息（需Token）
  python main.py enterprise --token "your_token" --company-id 28452163 --company 比亚迪

  # 按行业搜索天眼查企业
  python main.py enterprise --token "your_token" --industry 3612

  # 查看采集状态
  python main.py status
        """,
    )

    subparsers = parser.add_subparsers(dest="command", help="子命令")

    # --- financial 子命令 ---
    p_fin = subparsers.add_parser("financial", help="采集财务数据")
    p_fin.add_argument("--year", type=int, default=2025, help="采集年份（默认2025）")
    p_fin.add_argument("--source", choices=["akshare", "tushare", "baostock"], default="akshare", help="数据源（默认akshare）")
    p_fin.add_argument("--token", type=str, help="Tushare Token（tushare数据源必填）")
    p_fin.add_argument("--company", type=str, help="指定单家企业名称（不指定则批量采集）")

    # --- recruitment 子命令 ---
    p_rec = subparsers.add_parser("recruitment", help="采集招聘数据")
    p_rec.add_argument("--platform", choices=["official", "boss", "generic"], default="official", help="采集平台（默认official）")
    p_rec.add_argument("--company", type=str, help="指定单家企业名称")
    p_rec.add_argument("--cookie", type=str, help="BOSS直聘Cookie")
    p_rec.add_argument("--url", type=str, help="通用采集的目标URL")

    # --- enterprise 子命令 ---
    p_ent = subparsers.add_parser("enterprise", help="采集企业工商信息")
    p_ent.add_argument("--token", type=str, required=True, help="天眼查API Token")
    p_ent.add_argument("--company", type=str, help="企业名称")
    p_ent.add_argument("--company-id", type=str, help="天眼查企业ID")
    p_ent.add_argument("--industry", type=str, help="行业代码（如3612=汽车整车制造）")

    # --- status 子命令 ---
    p_status = subparsers.add_parser("status", help="查看采集状态")

    args = parser.parse_args()

    if args.command == "financial":
        cmd_financial(args)
    elif args.command == "recruitment":
        cmd_recruitment(args)
    elif args.command == "enterprise":
        cmd_enterprise(args)
    elif args.command == "status":
        cmd_status(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
